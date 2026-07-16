param(
    [ValidateSet('blue','green')]
    [string] = '',
    [switch]
)

# ─── helpers ───
ssh server "docker ps --format '{{.Names}} {{.Status}}'" *>&1 | Out-Null
if ( -ne 0) { Write-Error "Cannot reach server"; exit 1 }

function CurrentColor {
     = ssh server 'docker inspect bruskapp-admin-blue --format "{{.Name}}" 2>/dev/null' 
    if ( -eq 0) { return 'blue' }
    return 'green'
}

function HealthCheck(, [int]=10) {
    for (=0;  -lt ; ++) {
         = ssh server "curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://:3000/brk-mgmt/login 2>/dev/null"
        if ( -eq 200) { return True }
        Start-Sleep -Seconds 2
    }
    return False
}

function SwitchNginx() {
    ssh server @"
docker exec bruskapp-nginx sh -c 'cat > /etc/nginx/conf.d/default.conf << '\''EOF'\''
upstream admin_backend {
    server bruskapp-admin-;
}

server {
    listen 80;
    server_name bruskapp.com www.bruskapp.com;
    return 301 https://bruskapp.com\;
}

server {
    listen 443 ssl http2;
    server_name bruskapp.com www.bruskapp.com;

    ssl_certificate /etc/letsencrypt/live/bruskapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bruskapp.com/privkey.pem;

    client_max_body_size 100M;

    location /brk-mgmt/ {
        proxy_pass http://admin_backend/brk-mgmt/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
        proxy_set_header X-Forwarded-Proto \;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location /admin/ {
        proxy_pass http://admin_backend/admin/;
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
    }

    location /api/ {
        proxy_pass http://bruskapp-backend:4000/;
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
    }
}
EOF
' && nginx -s reload"
}

# ─── main ───
 = CurrentColor
if ( -or  -eq '') {
    if () { Write-Host "⟲ Rolling back..." }
     = if ( -eq 'blue') { 'green' } else { 'blue' }
} else {
     = 
}

Write-Host "→ Current active: "
Write-Host "→ Deploying to: "

ssh server "docker rm -f bruskapp-admin- 2>/dev/null" | Out-Null

Write-Host "→ Building bruskapp-admin- ..."
ssh server "cd /opt/bruskapp-infra && docker build -t bruskapp-admin: -f bruskapp-admin/Dockerfile bruskapp-admin/"
if ( -ne 0) { Write-Error "Build failed"; exit 1 }

Write-Host "→ Starting bruskapp-admin- ..."
ssh server "docker run -d --name bruskapp-admin- 
    --network opt_bruskapp-network 
    --restart unless-stopped 
    -e NODE_ENV=production 
    bruskapp-admin:"
if ( -ne 0) { Write-Error "Start failed"; exit 1 }

Write-Host "→ Health check (up to 20s) ..."
 = HealthCheck "bruskapp-admin-" 10
if (-not ) {
    Write-Host "✗ Health check FAILED. Rolling back..."
    ssh server "docker rm -f bruskapp-admin- 2>/dev/null"
    exit 1
}

Write-Host "✓ bruskapp-admin- is healthy. Switching nginx ..."
SwitchNginx 

Start-Sleep -Seconds 2

# verify
 = ssh server "curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://bruskapp.com/brk-mgmt/login 2>/dev/null"
if ( -eq 200) {
    Write-Host "✓ Site returns 200. Stopping old container () ..."
    ssh server "docker rm -f bruskapp-admin- 2>/dev/null"
    Write-Host "✓ Deploy complete. Active: "
} else {
    Write-Host "✗ Site returned  after switch. Rolling back to  ..."
    SwitchNginx 
    ssh server "docker rm -f bruskapp-admin- 2>/dev/null"
    exit 1
}
