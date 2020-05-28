import { Router } from 'express';
import materialRoutes from './material.route';
import atrributeRoutes from './attribute.route';
import typeRoutes from './type.route';

const router = Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

router.get('/version/:service', (req, res) => res.send(process.env.GIT_COMMIT_TAG || 'Not available'));

/**
 * API v1/material-attributes
 */
router.use('/material-attributes', atrributeRoutes);

/**
 * API v1/material-types
 */
router.use('/material-types', typeRoutes);

/**
 * API v1/materials
 */
router.use('/materials', materialRoutes);

export default router;
