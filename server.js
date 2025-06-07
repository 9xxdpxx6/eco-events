/*=================================*/
/*        Fake Mock Server         */
/*=================================*/

import express from 'express';
import cors from 'cors';
import jsonServer from 'json-server';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Получаем текущий путь
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем основной сервер
const server = express();
server.use(cors());

// Используем express.json() только для кастомных эндпоинтов
server.use('/api/auth', express.json());
server.use('/api/events/:id/join', express.json());
server.use('/api/events/:id/leave', express.json());
server.use('/api/profile', express.json());

// Кастомные эндпоинты для auth
server.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Читаем пользователей из db.json
    const dbPath = path.join(__dirname, 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const user = dbData.users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    res.json({ 
        token: 'fake-jwt-token', 
        message: 'authorized',
        user: {
            id: user.id,
            email: user.email,
            type: user.type
        }
    });
});

server.post('/api/auth/register', (req, res) => {
    res.status(201).json({ message: 'User created' });
});

server.get('/api/auth/me', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || token !== 'fake-jwt-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Читаем данные пользователей из db.json
    try {
        const dbPath = path.join(__dirname, 'db.json');
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        // Находим пользователя с email 'qwe'
        const user = dbData.users.find(u => u.email === 'qwe');
        
        if (user) {
            console.log('📋 Найден пользователь в db.json:', user);
            res.json({ 
                user: {
                    id: user.id,
                    email: user.email,
                    type: user.type
                }
            });
        } else {
            // Fallback на дефолтного пользователя
            res.json({ 
                user: {
                    id: 1, 
                    email: 'qwe', 
                    type: 'volunteer' 
                }
            });
        }
    } catch (error) {
        console.error('Ошибка чтения db.json:', error);
        // Fallback на дефолтного пользователя
        res.json({ 
            user: {
                id: 1, 
                email: 'qwe', 
                type: 'volunteer' 
            }
        });
    }
});

// Эндпоинты для регистрации на мероприятия
server.post('/api/events/:id/join', (req, res) => {
    const eventId = parseInt(req.params.id);
    console.log(`Пользователь регистрируется на мероприятие ${eventId}`);
    
    res.json({ 
        success: true, 
        message: 'Успешно зарегистрированы на мероприятие',
        eventId: eventId
    });
});

server.post('/api/events/:id/leave', (req, res) => {
    const eventId = parseInt(req.params.id);
    console.log(`Пользователь отменяет участие в мероприятии ${eventId}`);
    
    res.json({ 
        success: true, 
        message: 'Участие в мероприятии отменено',
        eventId: eventId
    });
});

// Эндпоинты для профиля
server.get('/api/profile', (req, res) => {
    res.json({
        id: 1,
        email: 'volunteer@test.com',
        type: 'volunteer'
    });
});

server.get('/api/profile/statistics', (req, res) => {
    res.json({
        eventsAttended: 5,
        points: 120,
        hoursVolunteered: 25,
        eventsCreated: 0,
        totalParticipants: 0,
        rating: 0
    });
});

// Кастомный эндпоинт для сортировки событий
server.get('/api/events', (req, res) => {
    const sort = req.query.sort || 'newest';
    const q = (req.query.q || '').toString().toLowerCase();
    const dbPath = path.join(__dirname, 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    let events = dbData.events.slice();

    // Фильтрация по поисковому запросу
    if (q) {
        events = events.filter(event =>
            (event.title && event.title.toLowerCase().includes(q)) ||
            (event.description && event.description.toLowerCase().includes(q)) ||
            (event.organization && event.organization.toLowerCase().includes(q)) ||
            (event.location && event.location.toLowerCase().includes(q))
        );
    }

    switch (sort) {
        case 'oldest':
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'participants':
            events.sort((a, b) => (b.participantsCount || 0) - (a.participantsCount || 0));
            break;
        case 'title':
            events.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
            break;
        case 'newest':
        default:
            events.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
    }
    res.json(events);
});

// Только после кастомных эндпоинтов монтируем json-server!
const jsonServerApp = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

jsonServerApp.use(middlewares);
jsonServerApp.use(router);

server.use('/api', jsonServerApp);

// Запуск сервера
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Mock API запущен на http://localhost:${PORT}`);
    console.log('Доступные эндпоинты:');
    console.log('- POST /api/auth/login');
    console.log('- POST /api/auth/register');
    console.log('- GET /api/auth/me');
    console.log('- POST /api/events/:id/join');
    console.log('- POST /api/events/:id/leave');
    console.log('- GET /api/profile');
    console.log('- GET /api/profile/statistics');
    console.log('- GET /api/events');
    console.log('- REST API для events под /api/');
});