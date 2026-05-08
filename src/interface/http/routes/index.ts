import { Router } from 'express';
import { GetGreeting } from '../../../application/use-cases/GetGreeting';
import { metricsHandler } from '../../middlewares/metrics';
import { GreetingController } from '../controllers/GreetingController';
import { HealthController } from '../controllers/HealthController';

const router = Router();

// Dependencies (usually handled by a DI container in larger apps)
const getGreetingUseCase = new GetGreeting();
const greetingController = new GreetingController(getGreetingUseCase);
const healthController = new HealthController();

router.get('/', greetingController.getGreeting);
router.get('/api/health', healthController.check);
router.get('/metrics', metricsHandler);

export default router;
