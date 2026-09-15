# 评分系统 API 文档

> 本文档根据当前后端代码的实际实现生成。后续任何接口变更需同步更新本文档。

## 基础信息

| 项       | 值                                                     |
| -------- | ------------------------------------------------------ |
| Base URL | `http://127.0.0.1:3000`                                |
| 数据格式 | `application/json`                                     |
| 认证方式 | 请求头 `Authorization: Bearer <token>`（登录接口返回） |

## 统一响应结构

所有接口的响应体都遵循同一结构，由后端 `ResponseUtils` 统一封装：

```json
{
  "code": 200, // HTTP 状态码
  "success": true, // 是否成功
  "message": "操作成功", // 提示信息
  "data": {} // 业务数据，失败或无可返回时为 null
}
```

## 统一错误码

| code | 含义                                                    |
| ---- | ------------------------------------------------------- |
| 400  | 参数校验失败 / 业务规则不满足（如重复评分、旧密码错误） |
| 401  | 未登录 / token 缺失、过期、无效                         |
| 403  | 已登录但无权限（非活动创建者 / 非活动评委）             |
| 404  | 资源不存在                                              |
| 500  | 服务器内部错误                                          |

## 认证说明

- 登录成功返回 `token`；后续请求在请求头携带 `Authorization: Bearer <token>`。
- `auth` 中间件负责解析并校验 token，通过后 `req.user = { userId, username }`。
- `requireCreator` / `requireJudge` 中间件负责活动级权限校验，分别要求当前用户为活动创建者 / 活动评委。

## 数据模型字段说明

### 用户（User）

| 字段      | 类型   | 说明                   |
| --------- | ------ | ---------------------- |
| id        | number | 用户 ID                |
| username  | string | 用户名（唯一）         |
| name      | string | 显示名称               |
| createdAt | string | 创建时间（ISO 字符串） |

### 活动（Event）

| 字段        | 类型           | 说明                                        |
| ----------- | -------------- | ------------------------------------------- |
| id          | number         | 活动 ID                                     |
| name        | string         | 活动名称                                    |
| description | string \| null | 活动描述                                    |
| creatorId   | number         | 创建者用户 ID                               |
| status      | string         | 活动状态：`pending` / `active` / `finished` |
| createdAt   | string         | 创建时间                                    |

### 队伍（Team）

| 字段      | 类型   | 说明        |
| --------- | ------ | ----------- |
| id        | number | 队伍 ID     |
| eventId   | number | 所属活动 ID |
| name      | string | 队伍名称    |
| createdAt | string | 创建时间    |

### 评分（Score）

| 字段      | 类型          | 说明                                                    |
| --------- | ------------- | ------------------------------------------------------- |
| id        | number        | 评分 ID                                                 |
| eventId   | number        | 活动 ID                                                 |
| teamId    | number        | 队伍 ID                                                 |
| judgeId   | number        | 评委用户 ID                                             |
| value     | string/number | 得分值（数据库为 Decimal(5,2)，原始查询序列化为字符串） |
| createdAt | string        | 创建时间                                                |

### 评委（EventJudge）

| 字段      | 类型   | 说明        |
| --------- | ------ | ----------- |
| id        | number | 评委记录 ID |
| eventId   | number | 活动 ID     |
| userId    | number | 评委用户 ID |
| createdAt | string | 创建时间    |

---

## 模块一：认证与用户 `/api/users`

### 1. 用户注册

- **POST** `/api/users/register`
- **鉴权**：无

请求体：

```json
{
  "username": "zhangsan",
  "password": "123456",
  "name": "张三"
}
```

| 参数     | 类型   | 必填 | 说明            |
| -------- | ------ | ---- | --------------- |
| username | string | 是   | 用户名，唯一    |
| password | string | 是   | 密码，至少 6 位 |
| name     | string | 是   | 显示名称        |

成功响应 `code: 201`，`data` 为创建的用户对象（不含密码）。

### 2. 用户登录

- **POST** `/api/users/login`
- **鉴权**：无

请求体：

```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

成功响应 `code: 200`，`data` 结构：

```json
{
  "id": 1,
  "username": "zhangsan",
  "name": "张三",
  "createdAt": "2026-09-14T00:00:00.000Z",
  "token": "<JWT>"
}
```

`token` 用于后续鉴权。

### 3. 删除用户（当前登录用户）

- **DELETE** `/api/users`
- **鉴权**：`auth`（从 token 取 userId，删除自己）

成功响应 `code: 200`，`data` 为 `null`。

### 4. 获取用户列表

- **GET** `/api/users`
- **鉴权**：`auth`

成功响应 `code: 200`，`data` 为用户数组（不含密码）。

### 5. 获取单个用户

- **GET** `/api/users/:id`
- **鉴权**：`auth`

路径参数：

| 参数 | 类型   | 说明    |
| ---- | ------ | ------- |
| id   | number | 用户 ID |

成功响应 `code: 200`，`data` 为用户对象。

### 6. 修改密码

- **PUT** `/api/users/password`
- **鉴权**：`auth`（修改当前登录用户自己的密码）

请求体：

```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

成功响应 `code: 200`，`data` 为更新后的用户对象。

### 7. 修改昵称

- **PUT** `/api/users/name`
- **鉴权**：`auth`

请求体：

```json
{
  "newName": "新昵称"
}
```

成功响应 `code: 200`，`data` 为更新后的用户对象。

---

## 模块二：活动管理 `/api/events`

### 1. 创建活动

- **POST** `/api/events`
- **鉴权**：`auth`（creatorId 取自 token）

请求体：

```json
{
  "name": "第三届知识科普大赛",
  "description": "活动描述"
}
```

| 参数        | 类型   | 必填 | 说明     |
| ----------- | ------ | ---- | -------- |
| name        | string | 是   | 活动名称 |
| description | string | 否   | 活动描述 |

成功响应 `code: 201`，`data` 为创建的活动对象。

### 2. 获取活动列表

- **GET** `/api/events`
- **鉴权**：`auth`

成功响应 `code: 200`，`data` 为活动数组（含 `creator: { id, name }`），按创建时间倒序。

### 3. 获取活动列表（含全部关联数据）

- **GET** `/api/events/all`
- **鉴权**：`auth`

返回每个活动带完整嵌套结构：`creator`、`judges`（含 `user`）、`teams`（含 `scores`，scores 含 `judge`）。

成功响应 `data` 结构：

```json
[
  {
    "id": 1,
    "name": "第三届知识科普大赛",
    "creator": { "id": 1, "name": "管理员" },
    "judges": [
      {
        "id": 1,
        "userId": 2,
        "user": { "id": 2, "name": "张老师", "username": "zhang" }
      }
    ],
    "teams": [
      {
        "id": 1,
        "name": "火箭小队",
        "scores": [
          { "id": 1, "value": "88.50", "judge": { "id": 2, "name": "张老师" } }
        ]
      }
    ]
  }
]
```

### 4. 获取单个活动

- **GET** `/api/events/getbyid/:eventId`
- **鉴权**：`auth`

路径参数 `eventId`：活动 ID。成功响应 `data` 为活动对象。

### 5. 更新活动信息

- **PUT** `/api/events/:eventId`
- **鉴权**：`auth` + `requireCreator`

请求体：

```json
{
  "name": "新名称",
  "description": "新描述",
  "status": "active"
}
```

成功响应 `code: 200`，`data` 为 `null`。

### 6. 删除活动

- **DELETE** `/api/events/:eventId`
- **鉴权**：`auth` + `requireCreator`

成功响应 `code: 200`，`data` 为 `null`。存在关联数据时返回 400。

### 7. 获取当前用户在某活动中的身份

- **GET** `/api/events/:eventId/my-role`
- **鉴权**：`auth`

路径参数 `eventId`：活动 ID。

成功响应 `code: 200`，`data` 结构：

```json
{ "role": "creator" }
```

`role` 取值与含义（判断顺序：creator 优先）：

| role      | 含义                            |
| --------- | ------------------------------- |
| `creator` | 活动创建者 → 前端跳转后台管理页 |
| `judge`   | 活动评委 → 前端跳转评分页       |
| `viewer`  | 其余用户 → 前端跳转大屏展示页   |

---

## 模块三：参赛队伍 `/api/teams`

### 1. 创建队伍

- **POST** `/api/teams/:eventId`
- **鉴权**：`auth` + `requireCreator`

请求体：

```json
{ "name": "火箭小队" }
```

路径参数 `eventId`：活动 ID。成功响应 `code: 201`，`data` 为队伍对象。

### 2. 获取队伍列表

- **GET** `/api/teams/getall/:eventId`
- **鉴权**：`auth`

成功响应 `code: 200`，`data` 为队伍数组。

### 3. 获取单个队伍

- **GET** `/api/teams/:teamId`
- **鉴权**：`auth`

成功响应 `code: 200`，`data` 为队伍对象。

### 4. 更新队伍

- **PUT** `/api/teams/:teamId`
- **鉴权**：`auth` + `requireCreator`

请求体：

```json
{ "name": "新队名" }
```

成功响应 `code: 200`，`data` 为更新后的队伍对象。

### 5. 删除队伍

- **DELETE** `/api/teams/:teamId`
- **鉴权**：`auth` + `requireCreator`

成功响应 `code: 200`，`data` 为 `null`。

---

## 模块四：评分 `/api/scores`

### 1. 创建得分

- **POST** `/api/scores/:teamId`
- **鉴权**：`auth` + `requireJudge`

路径参数 `teamId`：队伍 ID。请求体：

```json
{ "value": 88.5 }
```

`judgeId` 取自 token；`eventId` 由队伍追溯。同一评委对同一队伍只能打一次分（重复返回 400）。

成功响应 `code: 201`，`data` 为评分对象。

### 2. 获取得分列表

- **GET** `/api/scores/:teamId`
- **鉴权**：`auth`

成功响应 `code: 200`，`data` 为该队伍的所有评分数组。

### 3. 更新得分

- **PUT** `/api/scores/:teamId`
- **鉴权**：`auth` + `requireJudge`

请求体：

```json
{ "value": 92.5 }
```

更新当前评委对该队伍的评分。成功响应 `code: 200`，`data` 为 `null`。

### 4. 获取队伍平均分

- **GET** `/api/scores/getaverage/:teamId`
- **鉴权**：`auth`

成功响应 `data` 结构：

```json
{
  "average": 85.5, // 普通平均分
  "trimmedAverage": 86.0, // 去一个最高分、一个最低分后的平均分（不足3个评分时等于 average）
  "count": 4, // 评分总数
  "excludedCount": 2 // 实际去除的分数个数
}
```

无评分时 `average` / `trimmedAverage` 为 `null`，`count` 为 `0`。

### 5. 获取活动下所有队伍的平均分

- **GET** `/api/scores/getallaverage/:eventId`
- **鉴权**：`auth`

路径参数 `eventId`：活动 ID。成功响应 `data` 为数组，每个元素：

```json
{
  "teamId": 1,
  "teamName": "火箭小队",
  "average": 85.5,
  "trimmedAverage": 86.0,
  "count": 4,
  "excludedCount": 2
}
```

### 6. 清空队伍得分

- **DELETE** `/api/scores/clearall/:teamId`
- **鉴权**：`auth` + `requireCreator`

删除该队伍的全部评分。成功响应 `code: 200`，`data` 为 `null`。

### 7. 删除单条得分

- **DELETE** `/api/scores/:scoreId`
- **鉴权**：`auth` + `requireJudge`

路径参数 `scoreId`：评分 ID。成功响应 `code: 200`，`data` 为 `null`。

---

## 模块五：评委管理 `/api/judges`

### 1. 添加评委

- **POST** `/api/judges/:eventId`
- **鉴权**：`auth` + `requireCreator`

路径参数 `eventId`：活动 ID。请求体：

```json
{ "judgeId": 2 }
```

| 参数    | 类型   | 必填 | 说明                  |
| ------- | ------ | ---- | --------------------- |
| judgeId | number | 是   | 被添加为评委的用户 ID |

同一活动同一用户只能添加一次（重复返回 400）。成功响应 `code: 201`，`data` 为评委记录。

### 2. 获取评委列表

- **GET** `/api/judges/:eventId`
- **鉴权**：`auth`

成功响应 `code: 200`，`data` 为评委记录数组。

### 3. 移除评委

- **DELETE** `/api/judges/:judgeId`
- **鉴权**：`auth` + `requireCreator`

路径参数 `judgeId`：评委记录 ID。成功响应 `code: 200`，`data` 为 `null`。

---

## 附：尚未实现的规划模块

以下模块当前代码中**未实现**，仅作规划参考：

- 数据导出：`GET /api/export/:eventId`、`GET /api/export/detail/:eventId`
- 赛程控制与表演流程（WebSocket）
