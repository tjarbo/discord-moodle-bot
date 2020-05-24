import { Router } from 'express';
import swagger from 'swagger-ui-express';
import * as YAML from 'yamljs';
import path from 'path';
const documentation = YAML.load(path.join(__dirname, '../../../src/docs/rest-api.yml');

export const docRoutes = Router();

// register routes
docRoutes.use('/docs', swagger.serve);
docRoutes.get('/docs', swagger.setup(documentation));