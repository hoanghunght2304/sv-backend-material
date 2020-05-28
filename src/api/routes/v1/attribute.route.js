import express from 'express';
import validate from 'express-validation';
import { authorize } from 'auth-adapter';
import permissions from '../../../config/permissions';

import {
    listValidation,
    createValidation,
    updateValidation
} from '../../validations/v1/attribute.validation';

import middleware from '../../middlewares/attributes.middleware';
import controller from '../../controllers/v1/attributies.controller';

const router = express.Router();

router
    .route('/')
    .get(
        validate(listValidation),
        authorize([permissions.MATERIAL_ATTRIBUTE_LIST]),
        middleware.condition,
        controller.list
    )
    .post(
        validate(createValidation),
        authorize([permissions.MATERIAL_ATTRIBUTE_CREATE]),
        middleware.checkDuplicate,
        controller.create
    );

router
    .route('/:id')
    .get(
        authorize([permissions.MATERIAL_ATTRIBUTE_DETAIL]),
        middleware.load,
        controller.detail
    )
    .put(
        validate(updateValidation),
        authorize([permissions.MATERIAL_ATTRIBUTE_UPDATE]),
        middleware.load,
        controller.update
    )
    .delete(
        authorize([permissions.MATERIAL_ATTRIBUTE_DELETE]),
        middleware.load,
        controller.delete
    );

export default router;
