import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import TabsPage from '../views/TabsPage.vue';
import EventsListPage from '../views/EventsListPage.vue';
import VolunteerProfilePage from '../views/VolunteerProfilePage.vue';
import EventsManagementPage from '../views/EventsManagementPage.vue';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: (to) => {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        if (authStore.isVolunteer) {
          return '/tabs/events-list';
        } else if (authStore.isOrganization) {
          return '/tabs/events-management';
        }
      }
      return '/login';
    }
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
        redirect: (to) => {
          const authStore = useAuthStore();
          if (authStore.isVolunteer) {
            return '/tabs/events-list';
          } else if (authStore.isOrganization) {
            return '/tabs/events-management';
          }
          return '/tabs/events-list';
        }
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
        component: () => import('../views/MyRegistrationsPage.vue')
      },
      {
        path: 'bonuses',
        name: 'Bonuses',
        component: () => import('../views/BonusesPage.vue')
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
        component: () => import('../views/OrganizationProfilePage.vue')
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
    component: () => import('../views/CreateEventPage.vue')
  },
  {
    path: '/edit-event/:id',
    name: 'EditEvent',
    component: () => import('../views/EditEventPage.vue'),
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  console.log('🔍 Router guard:', {
    to: to.name,
    isAuthenticated: authStore.isAuthenticated,
    isAuthLoading: authStore.isAuthLoading,
    user: authStore.user
  });
  
  // Если пользователь не авторизован и пытается попасть не на страницы входа/регистрации
  if (!authStore.isAuthenticated && !['Login', 'Register'].includes(to.name as string)) {
    console.log('❌ Пользователь не авторизован, редирект на /login');
    next('/login');
  } 
  // Если пользователь авторизован и пытается попасть на страницы входа/регистрации
  else if (authStore.isAuthenticated && ['Login', 'Register'].includes(to.name as string)) {
    console.log('✅ Пользователь авторизован, редирект на главную');
    if (authStore.isVolunteer) {
      next('/tabs/events-list');
    } else if (authStore.isOrganization) {
      next('/tabs/events-management');
    } else {
      next('/tabs/events-list');
    }
  } 
  // Проверка доступа к страницам в зависимости от роли
  else if (authStore.isAuthenticated) {
    const volunteerOnlyRoutes = ['EventsList', 'MyRegistrations', 'Bonuses', 'VolunteerProfile'];
    const organizationOnlyRoutes = ['EventsManagement', 'OrganizationProfile', 'CreateEvent', 'EditEvent'];
    
    if (authStore.isVolunteer && organizationOnlyRoutes.includes(to.name as string)) {
      next('/tabs/events-list');
    } else if (authStore.isOrganization && volunteerOnlyRoutes.includes(to.name as string)) {
      next('/tabs/events-management');
    } else {
      next();
    }
  } 
  else {
    console.log('✅ Разрешён переход на', to.name);
    next();
  }
});

export default router;
