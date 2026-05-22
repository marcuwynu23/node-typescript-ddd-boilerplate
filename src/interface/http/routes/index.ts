import { Router } from 'express';
import { GetGreeting } from '../../../application/use-cases/GetGreeting';
import { metricsHandler } from '../../middlewares/metrics';
import { DocsAPIController } from '../controllers/DocsAPIController';
import { GreetingController } from '../controllers/GreetingController';
import { HealthController } from '../controllers/HealthController';

const router = Router();

// Dependencies (usually handled by a DI container in larger apps)
const getGreetingUseCase = new GetGreeting();
const greetingController = new GreetingController(getGreetingUseCase);
const healthController = new HealthController();
const docAPIController = new DocsAPIController();

router.get('/', greetingController.getGreeting);
router.get(['/health', '/ready', '/test', '/api/health', '/api/test'], healthController.check);
router.get(['/api', '/api/docs'], docAPIController.docsRedirect);
router.get('/metrics', metricsHandler);

export default router;
