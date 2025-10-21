# HTTP客户端封装

<cite>
**Referenced Files in This Document**   
- [http.ts](file://src/services/http.ts)
- [patentSearch.ts](file://src/services/patentSearch.ts)
- [techReport.ts](file://src/services/techReport.ts)
</cite>

## 目录
1. [简介](#简介)
2. [核心配置](#核心配置)
3. [请求拦截器](#请求拦截器)
4. [响应拦截器](#响应拦截器)
5. [自定义配置选项](#自定义配置选项)
6. [请求方法使用](#请求方法使用)
7. [文件上传处理](#文件上传处理)
8. [封装优势](#封装优势)

## 简介
该文档详细解析了`src/services/http.ts`中基于Axios的HTTP客户端封装机制。该封装通过创建统一的请求实例，配置基础URL、超时时间、请求/响应拦截器等核心参数，为整个应用提供了标准化的网络请求能力。封装的重点在于实现了自动化的JWT token注入和统一的错误处理策略，显著提升了API调用的一致性和可维护性。

## 核心配置
HTTP客户端的核心配置在`http.ts`文件中通过`axios.create()`方法完成，定义了所有请求的默认行为。

```mermaid
flowchart TD
A["创建Axios实例"] --> B["设置基础URL"]
B --> C["设置超时时间"]
C --> D["设置默认请求头"]
D --> E["配置请求拦截器"]
E --> F["配置响应拦截器"]
F --> G["导出实例和请求方法"]
```

**Diagram sources**
- [http.ts](file://src/services/http.ts#L10-L20)

**Section sources**
- [http.ts](file://src/services/http.ts#L10-L20)

## 请求拦截器
请求拦截器负责在每个请求发送前自动注入JWT token，确保用户认证信息的正确传递。

```mermaid
flowchart TD
Start([请求开始]) --> GetToken["从localStorage获取token"]
GetToken --> ParseToken{"token是JSON格式?"}
ParseToken --> |是| Parse["JSON.parse(token)"]
ParseToken --> |否| UseRaw["直接使用原始值"]
Parse --> StoreToken
UseRaw --> StoreToken
StoreToken["存储解析后的token"] --> CheckToken{"token存在?"}
CheckToken --> |否| Warn["记录警告日志"]
CheckToken --> |是| SetHeader["设置Authorization头"]
SetHeader --> LogRequest["记录请求调试信息"]
LogRequest --> SendRequest["发送请求"]
Warn --> SendRequest
```

**Diagram sources**
- [http.ts](file://src/services/http.ts#L30-L75)

**Section sources**
- [http.ts](file://src/services/http.ts#L30-L75)

## 响应拦截器
响应拦截器统一处理服务器返回的响应和错误，特别是对401未授权和500服务器错误等状态码进行集中管理。

```mermaid
flowchart TD
ReceiveResponse([接收到响应]) --> CheckBusinessCode["检查业务code"]
CheckBusinessCode --> Is401Code{"code === 401?"}
Is401Code --> |是| Handle401["处理401业务错误"]
Is401Code --> |否| ReturnResponse["直接返回响应"]
Handle401 --> PreventDuplicate{"已提示过?"}
PreventDuplicate --> |是| Reject["拒绝Promise"]
PreventDuplicate --> |否| MarkShown["标记已提示"]
MarkShown --> ClearStorage["清除localStorage认证信息"]
ClearStorage --> ShowMessage["显示'登录已过期'消息"]
ShowMessage --> Delay["延迟100ms"]
Delay --> Redirect["跳转到登录页"]
Redirect --> ResetFlag["重置提示标志"]
ResetFlag --> Reject
subgraph 错误处理分支
ReceiveError([接收到错误]) --> HasResponse{"有响应数据?"}
HasResponse --> |是| HandleHTTPError["处理HTTP错误"]
HasResponse --> |否| HandleNetworkError["处理网络错误"]
HandleHTTPError --> GetStatus["获取状态码"]
GetStatus --> Handle401Status{"状态码401?"}
Handle401Status --> |是| Handle401
Handle401Status --> |否| Handle403{"状态码403?"}
Handle403 --> |是| ShowForbidden["显示'没有权限'消息"]
Handle403 --> |否| Handle404{"状态码404?"}
Handle404 --> |是| ShowNotFound["显示'资源不存在'消息"]
Handle404 --> |否| Handle500{"状态码500?"}
Handle500 --> |是| ShowServerError["显示'服务器内部错误'消息"]
Handle500 --> |否| ShowDefault["显示默认错误消息"]
end
```

**Diagram sources**
- [http.ts](file://src/services/http.ts#L77-L200)

**Section sources**
- [http.ts](file://src/services/http.ts#L77-L200)

## 自定义配置选项
虽然HTTP实例有默认配置，但`request`对象提供了灵活的自定义选项，允许在特定请求中覆盖默认设置。

**Section sources**
- [http.ts](file://src/services/http.ts#L202-L248)

## 请求方法使用
封装的`request`对象提供了简洁的API来执行不同类型的HTTP请求，如GET和POST。

```mermaid
sequenceDiagram
participant Component as "业务组件"
participant Request as "request对象"
participant Api as "Axios实例"
Component->>Request : get('/api/patents', {keyword : '食用菌'})
Request->>Api : get('/api/patents', {params : {keyword : '食用菌'}})
Api->>Server : 发送GET请求
Server-->>Api : 返回响应
Api-->>Request : 返回AxiosResponse
Request-->>Component : 返回data字段
Component->>Request : post('/api/report', {prompt : '反无人机'})
Request->>Api : post('/api/report', {prompt : '反无人机'})
Api->>Server : 发送POST请求
Server-->>Api : 返回响应
Api-->>Request : 返回AxiosResponse
Request-->>Component : 返回data字段
```

**Diagram sources**
- [http.ts](file://src/services/http.ts#L202-L248)
- [patentSearch.ts](file://src/services/patentSearch.ts#L90-L105)
- [techReport.ts](file://src/services/techReport.ts#L90-L105)

**Section sources**
- [http.ts](file://src/services/http.ts#L202-L248)
- [patentSearch.ts](file://src/services/patentSearch.ts#L90-L105)
- [techReport.ts](file://src/services/techReport.ts#L90-L105)

## 文件上传处理
`request.upload`方法专门用于处理文件上传，自动设置正确的`Content-Type`头。

```mermaid
sequenceDiagram
participant Component as "业务组件"
participant Request as "request对象"
participant Api as "Axios实例"
Component->>Request : upload('/api/upload', formData)
Request->>Api : post('/api/upload', formData, {headers : {'Content-Type' : 'multipart/form-data'}})
Api->>Server : 发送POST请求
Server-->>Api : 返回响应
Api-->>Request : 返回AxiosResponse
Request-->>Component : 返回data字段
```

**Diagram sources**
- [http.ts](file://src/services/http.ts#L240-L248)
- [techReport.ts](file://src/services/techReport.ts#L320-L330)

**Section sources**
- [http.ts](file://src/services/http.ts#L240-L248)
- [techReport.ts](file://src/services/techReport.ts#L320-L330)

## 封装优势
该HTTP客户端封装通过统一的配置和拦截器机制，显著提升了应用的API调用一致性和可维护性。

**Section sources**
- [http.ts](file://src/services/http.ts)
- [patentSearch.ts](file://src/services/patentSearch.ts)
- [techReport.ts](file://src/services/techReport.ts)