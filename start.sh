#!/bin/sh

export API_PORT=8800

cd /app/api && npx prisma generate && npx prisma db push && API_PORT=$API_PORT npm start &


wait