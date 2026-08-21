import { parseDependencies } from "./parsers/dependency.parser";

const typescriptCode = `
import express from "express";
import authService from "../services/auth.service";
import { prisma } from "../config/prisma";

const jwt = require("../utils/jwt");
`;

const pythonCode = `
import storage
from src.storage import load_expenses
`;

console.log("\n==============================");
console.log("TypeScript Dependencies");
console.log("==============================");

console.log(
  parseDependencies(typescriptCode, "typescript"),
);

console.log("\n==============================");
console.log("Python Dependencies");
console.log("==============================");

console.log(
  parseDependencies(pythonCode, "python"),
);