/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAuth from "../adminAuth.js";
import type * as adminBackfills from "../adminBackfills.js";
import type * as adminImport from "../adminImport.js";
import type * as auth from "../auth.js";
import type * as model_practiceSessions from "../model/practiceSessions.js";
import type * as model_steps from "../model/steps.js";
import type * as model_validators from "../model/validators.js";
import type * as practiceSessions from "../practiceSessions.js";
import type * as steps from "../steps.js";
import type * as videoProcessing from "../videoProcessing.js";
import type * as videoProcessingActions from "../videoProcessingActions.js";
import type * as videoStorage from "../videoStorage.js";
import type * as videoStorageActions from "../videoStorageActions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminAuth: typeof adminAuth;
  adminBackfills: typeof adminBackfills;
  adminImport: typeof adminImport;
  auth: typeof auth;
  "model/practiceSessions": typeof model_practiceSessions;
  "model/steps": typeof model_steps;
  "model/validators": typeof model_validators;
  practiceSessions: typeof practiceSessions;
  steps: typeof steps;
  videoProcessing: typeof videoProcessing;
  videoProcessingActions: typeof videoProcessingActions;
  videoStorage: typeof videoStorage;
  videoStorageActions: typeof videoStorageActions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
