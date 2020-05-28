import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import controller from '../../controllers/v1/material.controller';
import middleware from '../../middlewares/material.middleware';
import permissions from '../../../config/permissions';
import {
    listValidation,
    createValidation,
    updateValidation
} from '../../validations/v1/material.validation';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.MATERIAL_LIST]),
        middleware.condition,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.MATERIAL_CREATE]),
        middleware.checkDuplicateById,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.MATERIAL_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.MATERIAL_UPDATE]),
        middleware.load,
        controller.update
    )
    .delete(
        authorize([permissions.MATERIAL_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;
