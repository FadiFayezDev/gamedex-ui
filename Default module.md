---
title: Default module
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# Default module

Base URLs:

# Authentication

# Ecosystem - Tags

## POST /api/v1/tags

POST /api/v1/tags

> Body Parameters

```json
{
  "name": "string",
  "description": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CreateTagRequest](#schemacreatetagrequest)| no |none|

> Response Examples

> 201 Response

```json
"497f6eca-6276-4993-bfeb-53cbbbba6f08"
```

```
"497f6eca-6276-4993-bfeb-53cbbbba6f08"
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Created|string|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad Request|[ProblemDetails](#schemaproblemdetails)|

## GET /api/v1/tags

GET /api/v1/tags

> Response Examples

> 200 Response

```json
[
  {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "name": "string",
    "description": "string"
  }
]
```

```
[{"id":"497f6eca-6276-4993-bfeb-53cbbbba6f08","name":"string","description":"string"}]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[TagResponse](#schematagresponse)]|false|none||none|
|» id|string(uuid)|false|none||none|
|» name|string¦null|false|none||none|
|» description|string¦null|false|none||none|

## GET /api/v1/tags/{id}

GET /api/v1/tags/{id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string(uuid)| yes |none|

> Response Examples

> 200 Response

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "name": "string",
  "description": "string"
}
```

```
{"id":"497f6eca-6276-4993-bfeb-53cbbbba6f08","name":"string","description":"string"}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[TagResponse](#schematagresponse)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Not Found|[ProblemDetails](#schemaproblemdetails)|

## PUT /api/v1/tags/{id}

PUT /api/v1/tags/{id}

> Body Parameters

```json
{
  "name": "string",
  "description": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string(uuid)| yes |none|
|body|body|[UpdateTagRequest](#schemaupdatetagrequest)| no |none|

> Response Examples

> 400 Response

```json
{
  "type": "string",
  "title": "string",
  "status": 0,
  "detail": "string",
  "instance": "string",
  "property1": null,
  "property2": null
}
```

```
{"type":"string","title":"string","status":0,"detail":"string","instance":"string","property1":null,"property2":null}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|No Content|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad Request|[ProblemDetails](#schemaproblemdetails)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Not Found|[ProblemDetails](#schemaproblemdetails)|

## DELETE /api/v1/tags/{id}

DELETE /api/v1/tags/{id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string(uuid)| yes |none|

> Response Examples

> 404 Response

```json
{
  "type": "string",
  "title": "string",
  "status": 0,
  "detail": "string",
  "instance": "string",
  "property1": null,
  "property2": null
}
```

```
{"type":"string","title":"string","status":0,"detail":"string","instance":"string","property1":null,"property2":null}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|No Content|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Not Found|[ProblemDetails](#schemaproblemdetails)|

# Data Schema

<h2 id="tocS_CreateTagRequest">CreateTagRequest</h2>

<a id="schemacreatetagrequest"></a>
<a id="schema_CreateTagRequest"></a>
<a id="tocScreatetagrequest"></a>
<a id="tocscreatetagrequest"></a>

```json
{
  "name": "string",
  "description": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|name|string¦null|false|none||none|
|description|string¦null|false|none||none|

<h2 id="tocS_ProblemDetails">ProblemDetails</h2>

<a id="schemaproblemdetails"></a>
<a id="schema_ProblemDetails"></a>
<a id="tocSproblemdetails"></a>
<a id="tocsproblemdetails"></a>

```json
{
  "type": "string",
  "title": "string",
  "status": 0,
  "detail": "string",
  "instance": "string",
  "property1": null,
  "property2": null
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|**additionalProperties**|any|false|none||none|
|type|string¦null|false|none||none|
|title|string¦null|false|none||none|
|status|integer(int32)¦null|false|none||none|
|detail|string¦null|false|none||none|
|instance|string¦null|false|none||none|

<h2 id="tocS_TagResponse">TagResponse</h2>

<a id="schematagresponse"></a>
<a id="schema_TagResponse"></a>
<a id="tocStagresponse"></a>
<a id="tocstagresponse"></a>

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "name": "string",
  "description": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string(uuid)|false|none||none|
|name|string¦null|false|none||none|
|description|string¦null|false|none||none|

<h2 id="tocS_UpdateTagRequest">UpdateTagRequest</h2>

<a id="schemaupdatetagrequest"></a>
<a id="schema_UpdateTagRequest"></a>
<a id="tocSupdatetagrequest"></a>
<a id="tocsupdatetagrequest"></a>

```json
{
  "name": "string",
  "description": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|name|string¦null|false|none||none|
|description|string¦null|false|none||none|

