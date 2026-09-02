import { parseDependencies } from "./parsers/dependency.parser";

const content = `
from .utils import helper
from .database import get_connection
from ..config import settings
import services
import models.user
`;

const dependencies = parseDependencies(content, "python");

console.log(dependencies);
