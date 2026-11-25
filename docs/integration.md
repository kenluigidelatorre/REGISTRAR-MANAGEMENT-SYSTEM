# Registrar Module Integration Contract

## Service details

- Registrar backend default port: `5001`
- Base path: `/api`
- Health check: `GET /health`
- Student list: `GET /api/registrar/students`
- Student detail: `GET /api/registrar/students/:studentId`

## Authentication between modules

The Library **backend** calls the Registrar backend. Include the HTTP header `X-Registrar-Service-Key` with the value configured as `REGISTRAR_SERVICE_KEY` in the Registrar backend environment and `REGISTRAR_SERVICE_KEY` (or the agreed secret name) in the Library backend environment. Never put this key in the Library frontend or commit it to Git. Use HTTPS in deployment and restrict service access to the project network where possible.

## Shared student fields

The read-only module endpoints return only these fields:

- `studentId`
- `fullName`
- `department`
- `program`
- `yearLevel`
- `yearBlock`
- `enrollmentStatus` (`ENROLLED`, `NOT_ENROLLED`, `GRADUATED`, or `DROPPED`)

They do not return date of birth, email, phone number, address, guardian details, or other private student information. Search can match student ID and name; it does not search email or contact information.

Example list response:

```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "studentId": "STU-1001",
      "fullName": "Juan Santos Dela Cruz",
      "department": "College of Information Technology",
      "program": "BSIT",
      "yearLevel": 2,
      "yearBlock": "2-B",
      "enrollmentStatus": "ENROLLED"
    }
  ]
}
```

Example request:

```powershell
$headers = @{ "X-Registrar-Service-Key" = $env:REGISTRAR_SERVICE_KEY }
Invoke-RestMethod -Uri "http://localhost:5001/api/registrar/students?status=ENROLLED" -Headers $headers
```

## Local network testing

If Library and Registrar run on different laptops, configure the Library **backend** to use the Registrar laptop's reachable LAN IPv4 address, for example `http://192.168.x.x:5001/api`. Do not use `localhost` across laptops. Allow inbound TCP port 5001 on the Registrar laptop's private-network firewall profile during the demo. In deployment, use the Registrar backend's HTTPS URL. The Library frontend should call only its own Library backend.

## Ownership and boundaries

Registrar owns the complete student record and database. Library receives only the projection above. Modules communicate through REST/JSON and must not access one another's databases directly. Finance should receive only the specific billing/payment data defined in a separate agreement; this student lookup endpoint does not provide payment data or modify Finance records.

## Error responses

- `401`: missing or invalid service key
- `404`: student ID not found
- `503`: service key not configured
