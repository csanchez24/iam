import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  unique,
  varchar,
  type AnyMySqlColumn,
} from 'drizzle-orm/mysql-core';

// ---------------------------------------------------------
// Applications Table
//
// Persist config (e.g. token and oauth settings) per application
// ---------------------------------------------------------
export const applications = mysqlTable(
  'applications',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    description: text('description'),
    type: mysqlEnum('type', ['m2m', 'nextjs']),
    domain: varchar('domain', { length: 255 }).notNull(),
    clientId: varchar('client_id', { length: 255 }).unique().notNull(),
    sercretId: varchar('secret_id', { length: 255 }).notNull(),
    homeUrl: varchar('home_url', { length: 255 }),
    loginUrl: varchar('login_url', { length: 255 }),
    logoutUrl: varchar('logout_url', { length: 255 }),
    callbackUrl: varchar('callback_url', { length: 255 }),
    idTokenExp: int('id_token_exp').default(3600).notNull(),
    accessTokenExp: int('access_token_exp').default(86400).notNull(),
    refreshTokenExp: int('refresh_token_exp').default(1296000).notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => ({
    nameIdx: index('name_idx').on(t.name),
  })
);

export const applicationsRelations = relations(applications, ({ many }) => ({
  permissions: many(permissions),
}));

export type Application = typeof applications.$inferSelect & {
  permissions?: Permission[];
};
export type NewApplication = typeof applications.$inferInsert;

// ---------------------------------------------------------
// Permissions Table
//
// Permission stores '{action}:{resource}' policies per
// application we assign to roles.
// ---------------------------------------------------------
export const permissions = mysqlTable(
  'permissions',
  {
    id: int('id').autoincrement().primaryKey(),
    key: varchar('key', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    applicationId: int('application_id').notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => ({
    keyApplicationUnique: unique('key_application_unique').on(t.key, t.applicationId),
    nameIdx: index('name_idx').on(t.name),
    applicationIdIdx: index('application_id_idx').on(t.applicationId),
  })
);

export const permissionsRelations = relations(permissions, ({ one }) => ({
  application: one(applications, {
    fields: [permissions.applicationId],
    references: [applications.id],
  }),
}));

export type Permission = typeof permissions.$inferSelect & {
  application?: Application;
};
export type NewPermission = typeof permissions.$inferInsert;

// ---------------------------------------------------------
// User Table
//
// Store everything we need to authenticate and authorize user
// ---------------------------------------------------------
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  middleName: varchar('middle_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 15 }),
  image: varchar('image', { length: 255 }),
  isActive: boolean('is_active').default(true),
  isAdmin: boolean('is_admin').default(false),
  isSuperAdmin: boolean('is_super_admin').default(false),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToRoles: many(usersToRoles),
  usersToLabels: many(usersToLabels),
}));

export type User = typeof users.$inferSelect & {
  usersToRoles?: UserToRole[];
  usersToLabels?: UserToLabel[];
};
export type NewUser = typeof users.$inferInsert;

// ---------------------------------------------------------
// Labels Table
//
// Labels e.g. admin, employee, company, ...
// ---------------------------------------------------------
export const labels = mysqlTable('labels', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  description: text('description'),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

export const labelsRelations = relations(labels, ({ many }) => ({
  usersToLabels: many(usersToLabels),
}));

export type Label = typeof labels.$inferSelect & {
  usersToLabels?: UserToLabel[];
};
export type NewLabel = typeof labels.$inferInsert;

// ---------------------------------------------------------
// Users To Labels Table
//
// Middle table between users and labels.
// ---------------------------------------------------------
export const usersToLabels = mysqlTable(
  'users_to_labels',
  {
    userId: int('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    labelId: int('label_id')
      .notNull()
      .references(() => labels.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.userId, t.labelId],
      name: 'user_label_pk',
    }),
  })
);

export const usersToLabelsRelations = relations(usersToLabels, ({ one }) => ({
  user: one(users, {
    fields: [usersToLabels.userId],
    references: [users.id],
  }),
  label: one(labels, {
    fields: [usersToLabels.labelId],
    references: [labels.id],
  }),
}));

export type UserToLabel = typeof usersToLabels.$inferSelect & {
  user: User;
  label: Label;
};
export type NewUserToLabel = {
  userId: number;
  labelId: number;
};

// ---------------------------------------------------------
// Roles Table
//
// Role is our way of grouping permissions to applications
// and assigning them to user to restrict app access.
// ---------------------------------------------------------
export const roles = mysqlTable(
  'roles',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).unique().notNull(),
    description: text('description'),
    applicationId: int('application_id').notNull(),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => ({
    roleNameIdx: index('role_name_idx').on(t.name),
  })
);

export const rolesRelations = relations(roles, ({ one, many }) => ({
  usersToRoles: many(usersToRoles),
  rolesToPermissions: many(rolesToPermissions),
  application: one(applications, {
    fields: [roles.applicationId],
    references: [applications.id],
  }),
}));

export type Role = typeof roles.$inferSelect & {
  application?: Application;
  rolesToPermissions?: RoleToPermission[];
};
export type NewRole = typeof roles.$inferInsert;

// ---------------------------------------------------------
// Roles To Permissions Table
//
// Middle table between roles and permissions.
// ---------------------------------------------------------
export const rolesToPermissions = mysqlTable(
  'roles_to_permissions',
  {
    roleId: int('role_id')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    permissionId: int('permission_id')
      .notNull()
      .references(() => permissions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.roleId, t.permissionId],
      name: 'role_permission_pk',
    }),
  })
);

export const rolesToPermissionsRelations = relations(rolesToPermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolesToPermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolesToPermissions.permissionId],
    references: [permissions.id],
  }),
}));

export type RoleToPermission = typeof rolesToPermissions.$inferSelect & {
  role: Role;
  permission: Permission;
};
export type NewRoleToPermission = typeof rolesToPermissions.$inferInsert;

// ---------------------------------------------------------
// Users To Roles Table
//
// Middle table between users and roles.
// ---------------------------------------------------------
export const usersToRoles = mysqlTable(
  'users_to_roles',
  {
    userId: int('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    roleId: int('role_id')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.userId, t.roleId],
      name: 'user_role_pk',
    }),
  })
);

export const userToRolesRelations = relations(usersToRoles, ({ one }) => ({
  user: one(users, {
    fields: [usersToRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [usersToRoles.roleId],
    references: [roles.id],
  }),
}));

export type UserToRole = typeof usersToRoles.$inferSelect & {
  user: User;
  role: Role;
};
export type NewUserToRole = {
  userId: number;
  roleId: number;
};

// ---------------------------------------------------------
// Authorization requests
//
// This table keeps track of the initial request for  grant_type
// 'authorization_requests'.
// ---------------------------------------------------------
export const authorizationRequests = mysqlTable('authorization_requests', {
  id: int('id').autoincrement().primaryKey(),
  pid: varchar('pid', { length: 255 }).unique().notNull(),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  responseType: mysqlEnum('response_type', ['code', 'token']).notNull(),
  redirectUrl: text('redirect_url').notNull(),
  scope: varchar('scope', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }).unique().notNull(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

export type AuthorizationRequest = typeof authorizationRequests.$inferSelect;
export type NewAuthorizationRequest = typeof authorizationRequests.$inferInsert;

// ---------------------------------------------------------
// Password reset requests
//
// Keep track of the password reset authorization request.
// Here we'll have to store the `authorization_request`
// public id (pid) in order to reference to redirect the user
// back to the rest of the auth flow.
// ---------------------------------------------------------
export const passwordResetRequests = mysqlTable('password_reset_requests', {
  id: int('id').autoincrement().primaryKey(),
  pid: varchar('pid', { length: 255 }).unique().notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  userId: int('user_id').notNull(),
  authReqPid: varchar('authorization_request_pid', { length: 255 }).notNull(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

export type AuthorizationPasswordReset = typeof passwordResetRequests.$inferSelect;
export type NewAuthorizationPasswordReset = typeof passwordResetRequests.$inferInsert;

// ---------------------------------------------------------
// Authorization codes
//
// This table continues the auth flow intiated by  the
// `authorization_requests`. Here we persist the exchange code
// and add the expiration time(1m).
// ---------------------------------------------------------
export const authorizationCodes = mysqlTable('authorization_codes', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  clientId: varchar('client_id', { length: 255 }).notNull(),
  code: varchar('code', { length: 255 }).unique().notNull(),
  responseType: mysqlEnum('response_type', ['code', 'token']).notNull(),
  redirectUrl: text('redirect_url').notNull(),
  scope: varchar('scope', { length: 255 }).notNull(),
  expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 })
    .default(sql`(DATE_ADD(NOW(), INTERVAL 1 MINUTE))`)
    .notNull(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

export type AuthorizationCode = typeof authorizationCodes.$inferSelect;
export type NewAuthorizationCode = typeof authorizationCodes.$inferInsert;

// ---------------------------------------------------------
// Authorization codes
//
// This table tracks grant_type 'refresh_token' helping us
// mitigate 'replay attacks' as we create new rotations
//
// You can read more here:
// https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/
// ---------------------------------------------------------
export const refreshTokens = mysqlTable('refresh_tokens', {
  id: int('id').autoincrement().primaryKey(),
  key: varchar('key', { length: 255 }).unique().notNull(),
  token: text('token').notNull(),
  descendantKey: varchar('descendant_key', { length: 255 }).references(
    (): AnyMySqlColumn => refreshTokens.key,
    { onDelete: 'cascade', onUpdate: 'cascade' }
  ),
  expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  descendant: one(refreshTokens, {
    fields: [refreshTokens.descendantKey],
    references: [refreshTokens.key],
  }),
}));

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
