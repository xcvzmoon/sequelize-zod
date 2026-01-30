# Sequelize Zod

Generate [Zod](https://zod.dev/) schemas from your [Sequelize](https://sequelize.org/) models. This library is inspired by [drizzle-zod](https://orm.drizzle.team/docs/zod): you define attributes with a column builder, optionally register a Sequelize model, and get select, insert, and update Zod schemas with correct TypeScript inference.

---

## Installation

```bash
pnpm add @xcvzmoon/sequelize-zod sequelize zod
```

Peer dependencies: `sequelize` (^6.37.7) and `zod` (^4.3.6).

---

## Overview

- **Column factory**: Define table columns with a chainable API (`integer()`, `string()`, `date()`, etc.) that maps to Sequelize data types.
- **defineModel**: Build a Sequelize model from those attributes so one definition drives both the database schema and validation.
- **Schema helpers**: `createSelectSchema`, `createInsertSchema`, and `createUpdateSchema` produce Zod schemas from either your attribute object or from an existing Sequelize model.
- **Refinements**: Override or refine any field in the generated schemas (e.g. add `.min()`, `.max()`, or custom validation).

You can use the column builder and schema helpers without a database; only `defineModel` requires a Sequelize instance.

---

## Quick start

### 1. Define attributes with the column factory

```ts
import {
  integer,
  string,
  boolean,
  date,
  enumType,
  defineModel,
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from '@xcvzmoon/sequelize-zod';
import type { InferModelFromAttributes } from '@xcvzmoon/sequelize-zod';
import { Sequelize } from 'sequelize';
import { z } from 'zod';

const userAttributes = {
  id: integer().primaryKey().autoIncrement(),
  name: string(100).notNull(),
  active: boolean().defaultValue(true),
  role: enumType('admin', 'user', 'guest').notNull().defaultValue('user'),
  createdAt: date().defaultValue(() => new Date()),
};

type UserModel = InferModelFromAttributes<typeof userAttributes>;
```

### 2. Create Zod schemas from attributes (no DB required)

```ts
const selectSchema = createSelectSchema(userAttributes);
const insertSchema = createInsertSchema(userAttributes);
const updateSchema = createUpdateSchema(userAttributes);

type UserSelect = z.infer<typeof selectSchema>;
type UserInsert = z.infer<typeof insertSchema>;
type UserUpdate = z.infer<typeof updateSchema>;

const result = insertSchema.safeParse({ name: 'Alice', role: 'user' });
```

### 3. Optional: define a Sequelize model and derive schemas from it

```ts
const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
const User = defineModel(sequelize, 'User', userAttributes);

const selectFromModel = createSelectSchema(User);
const insertFromModel = createInsertSchema(User);
const updateFromModel = createUpdateSchema(User);
```

---

## Column factory

Columns are defined with builder functions. Each returns a chainable builder with methods such as `.primaryKey()`, `.autoIncrement()`, `.notNull()`, `.allowNull()`, `.defaultValue()`, `.unique()`, `.references()`, etc.

### Numeric

| Function          | Sequelize type | Notes                    |
| ----------------- | -------------- | ------------------------ |
| `integer()`       | INTEGER        |                          |
| `bigint()`        | BIGINT         | TypeScript: `bigint`     |
| `float(l?, d?)`   | FLOAT          | Optional length/decimals |
| `real(l?, d?)`    | REAL           |                          |
| `double(l?, d?)`  | DOUBLE         |                          |
| `decimal(p?, s?)` | DECIMAL        | Optional precision/scale |

### String and text

| Function     | Sequelize type | Notes                          |
| ------------ | -------------- | ------------------------------ |
| `string(n?)` | STRING         | Optional length                |
| `char(n?)`   | CHAR           |                                |
| `text(t?)`   | TEXT           | `'tiny' \| 'medium' \| 'long'` |

### Boolean and dates

| Function     | Sequelize type | Notes             |
| ------------ | -------------- | ----------------- |
| `boolean()`  | BOOLEAN        |                   |
| `date(n?)`   | DATE           | JavaScript `Date` |
| `dateonly()` | DATEONLY       |                   |
| `time()`     | TIME           |                   |

### UUIDs

| Function   | Sequelize type |
| ---------- | -------------- |
| `uuid()`   | UUID           |
| `uuidv1()` | UUIDV1         |
| `uuidv4()` | UUIDV4         |

### JSON and blob

| Function     | Sequelize type | Notes                          |
| ------------ | -------------- | ------------------------------ |
| `json<T>()`  | JSON           | Generic for shape              |
| `jsonb<T>()` | JSONB          |                                |
| `blob(t?)`   | BLOB           | `'tiny' \| 'medium' \| 'long'` |

### Enum and array

| Function            | Sequelize type | Notes                      |
| ------------------- | -------------- | -------------------------- |
| `enumType(...vals)` | ENUM           | Literal union              |
| `array(type)`       | ARRAY          | Pass Sequelize `DataTypes` |

### PostgreSQL-specific (when using Postgres)

`range()`, `geometry()`, `geography()`, `hstore()`, `cidr()`, `inet()`, `macaddr()`, `citext()`, `tsvector()`. Virtual columns: `virtual(returnType, dependencies?)`.

---

## Schema helpers

### createSelectSchema(input, refinements?)

Builds a Zod object schema for the full row shape (e.g. query results). All columns are included; optionality follows `allowNull` and `hasDefault`.

- **input**: A record of column builders (e.g. `userAttributes`) or a Sequelize `ModelStatic`.
- **refinements**: Optional `Record<string, z.ZodType | (schema => z.ZodType)>` to override or refine fields.

### createInsertSchema(input, refinements?)

Builds a Zod schema for insert payloads. Auto-generated (identity) columns are omitted. Fields are optional when `allowNull` or `hasDefault` is true.

- **input**: Same as `createSelectSchema`.
- **refinements**: Same as above.

### createUpdateSchema(input, refinements?)

Builds a Zod schema for partial updates. All fields are optional; generated columns are omitted.

- **input**: Same as `createSelectSchema`.
- **refinements**: Same as above.

### Refinements example

```ts
const insertSchema = createInsertSchema(userAttributes, {
  name: z.string().min(2).max(100),
  role: (schema) => schema.refine((v) => ['admin', 'user', 'guest'].includes(v as string)),
});
```

---

## defineModel(sequelize, modelName, attributes)

Registers a Sequelize model with the given name and the attribute record built with the column factory. Returns a `ModelStatic` whose instance type matches `InferModelFromAttributes<typeof attributes>`.

Use the same attributes with `createSelectSchema`, `createInsertSchema`, and `createUpdateSchema` so types stay in sync.

---

## Exported types

| Type                           | Description                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `InferModelFromAttributes<T>`  | Sequelize model instance type from an attribute record `T`.                             |
| `InferSelectFromAttributes<T>` | Select/row shape from attributes. Use with `z.infer<typeof createSelectSchema(attrs)>`. |
| `InferSelectFromModel<M>`      | Select shape from a Sequelize model.                                                    |
| `InferInsertFromAttributes<T>` | Insert payload type from attributes.                                                    |
| `InferInsertFromModel<M>`      | Insert payload type from a model.                                                       |
| `InferUpdateFromAttributes<T>` | Partial update type from attributes.                                                    |
| `InferUpdateFromModel<M>`      | Partial update type from a model.                                                       |
| `ColumnSchemaDescriptor`       | Internal descriptor (category, allowNull, hasDefault, isGenerated, enumValues).         |
| `DataTypeCategory`             | Category string used for Zod mapping (`'integer'`, `'string'`, etc.).                   |

---

## Inspiration

This project is inspired by [drizzle-zod](https://orm.drizzle.team/docs/zod), which provides Zod schema generation from Drizzle ORM schemas. Sequelize Zod aims to offer a similar workflow for Sequelize: define columns once, then derive select, insert, and update schemas with full type inference.

---

## License

ISC
