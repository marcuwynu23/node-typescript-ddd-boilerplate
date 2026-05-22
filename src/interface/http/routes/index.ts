import express, { Router } from 'express';
import { CreateGreeting } from '../../../application/use-cases/CreateGreeting';
import { DeleteGreeting } from '../../../application/use-cases/DeleteGreeting';
import { GetGreeting } from '../../../application/use-cases/GetGreeting';
import { UpdateGreeting } from '../../../application/use-cases/UpdateGreeting';
import { MongoGreetingRepository } from '../../../infrastructure/database/repositories/MongoGreetingRepository';
import { metricsHandler } from '../../middlewares/metrics';
import { DocsAPIController } from '../controllers/DocsAPIController';
import { GreetingController } from '../controllers/GreetingController';
import { HealthController } from '../controllers/HealthController';

const router = Router();

// Parse JSON bodies
router.use(express.json());

// Dependencies
const greetingRepository = new MongoGreetingRepository();
const getGreetingUseCase = new GetGreeting(greetingRepository);
const createGreetingUseCase = new CreateGreeting(greetingRepository);
const updateGreetingUseCase = new UpdateGreeting(greetingRepository);
const deleteGreetingUseCase = new DeleteGreeting(greetingRepository);

const greetingController = new GreetingController(
  getGreetingUseCase,
  createGreetingUseCase,
  updateGreetingUseCase,
  deleteGreetingUseCase
);
const healthController = new HealthController();
const docAPIController = new DocsAPIController();

// Default greeting (no DB)
router.get('/', greetingController.getGreeting);

// CRUD routes for greetings
router.get('/api/greetings', greetingController.getAll);
router.get('/api/greetings/:id', greetingController.getById);
router.post('/api/greetings', greetingController.create);
router.put('/api/greetings/:id', greetingController.update);
router.delete('/api/greetings/:id', greetingController.delete);

// Health, docs & metrics
router.get(['/health', '/ready', '/test', '/api/health', '/api/test'], healthController.check);
router.get(['/api', '/api/docs'], docAPIController.docsRedirect);
router.get('/metrics', metricsHandler);

export default router;
