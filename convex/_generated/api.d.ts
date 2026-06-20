/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as checkouts from "../checkouts.js";
import type * as crons from "../crons.js";
import type * as csvImport from "../csvImport.js";
import type * as dashboard from "../dashboard.js";
import type * as files from "../files.js";
import type * as inventory from "../inventory.js";
import type * as lib_employeeCode from "../lib/employeeCode.js";
import type * as lib_password from "../lib/password.js";
import type * as lib_rbac from "../lib/rbac.js";
import type * as lib_session from "../lib/session.js";
import type * as notifications from "../notifications.js";
import type * as reports from "../reports.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as technicians from "../technicians.js";
import type * as tools from "../tools.js";
import type * as transactions from "../transactions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  checkouts: typeof checkouts;
  crons: typeof crons;
  csvImport: typeof csvImport;
  dashboard: typeof dashboard;
  files: typeof files;
  inventory: typeof inventory;
  "lib/employeeCode": typeof lib_employeeCode;
  "lib/password": typeof lib_password;
  "lib/rbac": typeof lib_rbac;
  "lib/session": typeof lib_session;
  notifications: typeof notifications;
  reports: typeof reports;
  search: typeof search;
  seed: typeof seed;
  technicians: typeof technicians;
  tools: typeof tools;
  transactions: typeof transactions;
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
