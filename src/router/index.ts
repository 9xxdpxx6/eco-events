import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import TabsPage from '../views/TabsPage.vue';
import EventsListPage from '../views/volunteer/EventsListPage.vue';
import VolunteerProfilePage from '../views/volunteer/VolunteerProfilePage.vue';
import EventsManagementPage from '../views/organization/EventsManagementPage.vue';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/events-list'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/events-list'
      },
      // Маршруты для волонтёров
      {
        path: 'events-list',
        name: 'EventsList',
        component: EventsListPage
      },
      {
        path: 'my-registrations',
        name: 'MyRegistrations',
        component: () => import('../views/volunteer/MyRegistrationsPage.vue')
      },
      {
        path: 'bonuses',
        name: 'Bonuses',
        component: () => import('../views/volunteer/BonusesPage.vue')
      },
      {
        path: 'volunteer-profile',
        name: 'VolunteerProfile',
        component: VolunteerProfilePage
      },
      // Маршруты для организаций
      {
        path: 'events-management',
        name: 'EventsManagement',
        component: EventsManagementPage
      },
      {
        path: 'organization-profile',
        name: 'OrganizationProfile',
        component: () => import('../views/organization/OrganizationProfilePage.vue')
      }
    ]
  },
  // Отдельные страницы
  {
    path: '/event/:id',
    name: 'EventDetailsAlias',
    component: () => import('../views/EventDetailsPage.vue'),
    props: true
  },
  {
    path: '/create-event',
    name: 'CreateEvent',
    component: () => import('../views/organization/CreateEventPage.vue')
  },
  {
    path: '/edit-event/:id',
    name: 'EditEvent',
    component: () => import('../views/organization/EditEventPage.vue'),
    props: true
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('../views/EditProfilePage.vue')
  },
  {
    path: '/notification-settings',
    name: 'NotificationSettings',
    component: () => import('../views/NotificationSettingsPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Восстанавливаем авторизацию из localStorage при каждой навигации
  if (!authStore.isAuthenticated) {
    authStore.restoreAuth();
  }
  
  const isAuthRoute = ['Login', 'Register'].includes(to.name as string);
  
  // Неавторизованные пользователи → на страницы входа
  if (!authStore.isAuthenticated && !isAuthRoute) {
    return next('/login');
  } 
  
  // Авторизованные пользователи не должны видеть страницы входа
  if (authStore.isAuthenticated && isAuthRoute) {
    const defaultRoute = authStore.isUser ? '/tabs/events-list' : '/tabs/events-management';
    return next(defaultRoute);
  }
  
  // Перенаправление с корневых путей
  if (authStore.isAuthenticated && (to.path === '/' || to.path === '/tabs' || to.path === '/tabs/')) {
    const defaultRoute = authStore.isUser ? '/tabs/events-list' : '/tabs/events-management';
    return next(defaultRoute);
    }
  
  // Проверка доступа по ролям
  if (authStore.isAuthenticated) {
    const volunteerOnlyRoutes = ['EventsList', 'MyRegistrations', 'Bonuses', 'VolunteerProfile'];
    const organizationOnlyRoutes = ['EventsManagement', 'OrganizationProfile', 'CreateEvent', 'EditEvent'];
    
    if (authStore.isUser && organizationOnlyRoutes.includes(to.name as string)) {
      return next('/tabs/events-list');
    }
    
    if (authStore.isOrganization && volunteerOnlyRoutes.includes(to.name as string)) {
      return next('/tabs/events-management');
    }
  } 
  
    next();
});

export default router;
