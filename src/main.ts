import { View } from './views/view';
import { Model } from './models/model';
import { Controller } from './controllers/controller';

const view = new View();
const model = new Model();
new Controller(view, model);