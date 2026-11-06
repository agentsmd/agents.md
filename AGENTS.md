# Aurelian Intelligence Platform Coding Agent Instructions (Corrected Version)

This `agents.md` configures a custom AI coding agent in Continue.dev for developing the Aurelian Intelligence Platform—a personal, cyberpunk-themed OSINT and red teaming dashboard. Use this as the primary guide for all edits/refactors. The agent must prioritize **incremental changes** (no full wipes unless flagged), **TypeScript strict mode**, and **live integrations** (no mocks/dummies—pull from real APIs like OpenSky, TomTom). Always reference the **COMPLETE_FEATURES_SUMMARY.md** (embedded below) for 1:1 UI-backend matching: Every backend feature (/api endpoint, WS event) must have a corresponding UI component/hook (e.g., sidebar "VPN Rotation" → /api/vpn-proxy button w/ real-time status). UI must remain beautiful: Dark void (#000000-#1A1A1A), glassmorphism (20-30% opacity blur 8-16px cyan borders rgba(0,255,255,0.2)), neon palette (Cyan #00FFFF flows, Green #00FF7F success, Purple #8A2BE2 AI, Red/Orange #FF4500 threats). Fonts: Montserrat Bold (headings 20-32px uppercase cyan shadow), Inter Regular (body/chat 12-16px lh1.5), JetBrains Mono (metrics 11-14px). Fluidity: Framer Motion (300ms parallax). Clarity: 12:1 contrast, 60%+ center whitespace, default collapsed (sidebar icons-only 60px, right thin strip).

## Prerequisite: 1:1 UI-Backend Matching
- UI must mirror backend exactly: E.g., /api/osint → sidebar "Web/OSINT" button triggers Axios GET, results overlay on map (neon pins). /api/vpn-proxy/rotate → metrics bar updates live via WS. No gaps—scan backend for every feature, add UI toggle/hook if missing (e.g., /api/cameras → "Cameras" layer in map-layers, video grid on toggle).
- Beautiful Fidelity: All interactions cyberpunk-polished (e.g., API success: Green neon pulse on orb; error: Red gradient fade in chat). Test: "Does UI call backend live? Does it look sexy?"

## Embedded COMPLETE_FEATURES_SUMMARY.md (Reference for Matching)
# Complete Features Summary - Aurelian Intelligence Platform

## ✅ All Features Implemented and Ready

### 1. Core Intelligence Features

#### Data Aggregation
- ✅ Web Search (Brave API, SearXNG)
- ✅ OSINT (WHOIS, DNS, IP Geolocation, Business Registry)
- ✅ Academic Search (arXiv, CrossRef, Semantic Scholar)
- ✅ RSS Feed Monitoring (Real-time parsing)
- ✅ Social Media (Reddit, Twitter/X via Nitter)
- ✅ News Aggregation (International sources)
- ✅ Blockchain Analysis (Ethereum, Bitcoin via public RPC)
- ✅ Flight Tracking (OpenSky Network)
- ✅ Historical Archives (Wayback Machine, Archive.today)
- ✅ Dark Web Monitoring (Ahmia.fi, Have I Been Pwned)

#### Cybersecurity Research
- ✅ Network Scanning (Port scanning)
- ✅ Service Enumeration (Banner grabbing)
- ✅ Traffic Analysis (Protocol identification)
- ✅ Reconnaissance (Passive/Active)
- ✅ APT Threat Modeling (MITRE ATT&CK)
- ✅ Adversary Emulation (9-phase plans)
- ✅ Attack Chain Modeling (Lockheed Kill Chain, MITRE)
- ✅ Red Team Planning (Exercise planning)
- ✅ Network Topology Enumeration
- ✅ Service Fingerprinting
- ✅ Authentication Analysis
- ✅ Data Exfiltration Pattern Analysis
- ✅ Privilege Escalation Vector Analysis

#### Intelligence Platforms
- ✅ OSINT Aggregator (Multiple sources)
- ✅ Geospatial Intelligence (Flight/Maritime tracking)
- ✅ Enhanced Blockchain Intelligence (Transaction monitoring)
- ✅ Financial Intelligence (Market data, SEC filings)
- ✅ Signals Intelligence (WiFi/Bluetooth enumeration)
- ✅ Universal Data Aggregator (Multi-method access)
- ✅ Unified Data Assimilation (All sources)

### 2. Advanced Features

#### Authentication & Security
- ✅ Master Authentication (Voice recognition)
- ✅ Warrant Verification (Deepfake detection)
- ✅ Audit Logging (Complete audit trail)
- ✅ Session Management (Time-limited sessions)

#### Access Control
- ✅ Public Camera Monitor (Public cameras only)
- ✅ Phone Integration (User authorized)
- ✅ Robots.txt Learning (Compliant learning)
- ✅ Digital Footprint Management (User authorized)

#### VPN/Proxy Rotation (NEW!)
- ✅ Free HTTP/HTTPS Proxies (Multiple sources)
- ✅ SOCKS4/SOCKS5 Proxies
- ✅ Free VPN Configurations (ProtonVPN, FreeVPN.me)
- ✅ Encryption Support (AES-256, ChaCha20, TLS 1.3)
- ✅ Automatic Proxy Rotation
- ✅ Ad Blocker Bypass Headers
- ✅ Browser Shield Bypass Headers
- ✅ Cloudflare Bypass Headers
- ✅ User-Agent Rotation
- ✅ IP Header Rotation (X-Forwarded-For, CF-Connecting-IP)

### 3. AI/ML Features

#### LLM Integration
- ✅ OpenAI Integration
- ✅ Anthropic Integration
- ✅ Local Model Support
- ✅ LLM Data Formatting
- ✅ Key Point Extraction
- ✅ Entity Recognition
- ✅ Streaming Support

#### Analytics
- ✅ Pattern Recognition Engine
- ✅ Anomaly Detection
- ✅ Correlation Analysis
- ✅ Predictive Modeling
- ✅ Statistical Analysis

### 4. Storage & Knowledge

#### Knowledge Management
- ✅ ChromaDB Vector Storage
- ✅ Entity Graph Database
- ✅ Time-Series Storage
- ✅ Source Citation Tracking
- ✅ Semantic Search
- ✅ Vector Embeddings

#### Caching
- ✅ Redis Caching (Optional)
- ✅ In-Memory Caching
- ✅ Cache Invalidation

### 5. API Endpoints

All features accessible via REST API:
- ✅ `/api/health` - Health check
- ✅ `/api/feeds/*` - RSS feed management
- ✅ `/api/alerts/*` - Keyword alerts
- ✅ `/api/social/*` - Social media
- ✅ `/api/news/*` - News aggregation
- ✅ `/api/blockchain/*` - Blockchain analysis
- ✅ `/api/flight/*` - Flight tracking
- ✅ `/api/vpn-proxy/*` - VPN/Proxy rotation (NEW!)
- ✅ `/api/footprint/*` - Digital footprint management
- ✅ `/api/assimilate/*` - Unified data assimilation
- ✅ `/api/intelligence/*` - Intelligence platform
- ✅ `/api/knowledge/*` - Knowledge management
- ✅ `/api/auth/master/*` - Master authentication
- ✅ `/api/cameras/*` - Public camera monitoring
- ✅ `/api/phone/*` - Phone integration
- ✅ `/api/learning/*` - Robots.txt learning
- And many more...

### 6. Real-Time Features

- ✅ WebSocket Communication
- ✅ Real-Time Data Updates
- ✅ Live Notifications
- ✅ Streaming Responses

### 7. Deployment Ready

#### Vercel Deployment
- ✅ `vercel.json` - Main configuration
- ✅ `api/[[...path]].py` - Serverless function handler
- ✅ `backend/requirements.txt` - Dependencies (including Mangum)
- ✅ `frontend/vite.config.ts` - Optimized build
- ✅ `.vercelignore` - Exclusion list
- ✅ Complete deployment documentation

## 🎯 Key Features

### VPN/Proxy Rotation (NEW!)

**Free Proxy Sources**:
- GitHub Proxy Lists (HTTP, SOCKS4, SOCKS5)
- ProxyScrape API
- Proxy-List.download
- Free-Proxy-List.net

**Free VPN Services**:
- ProtonVPN (Public API)
- FreeVPN.me
- VPNBook

**Bypass Features**:
- Ad Blocker Bypass Headers
- Browser Shield Bypass Headers
- Cloudflare Bypass Headers
- User-Agent Rotation
- IP Header Rotation (X-Forwarded-For, CF-Connecting-IP)

**Encryption**:
- AES-256-CBC
- ChaCha20-Poly1305
- TLS 1.3

### Digital Footprint Management

**Platforms Supported**:
- Twitter/X
- Facebook
- LinkedIn
- Instagram
- Reddit
- YouTube
- TikTok

**Operations**:
- Access footprint data
- Create content
- Update content
- Remove content
- Full footprint management

**Security**:
- OAuth authorization required
- Explicit user consent
- Complete audit logging
- GDPR/CCPA compliant

### Unified Data Assimilation

**Source Types**:
- Public (No authorization needed)
- Private (Authorization required)
- Unsecured (Ethical authorization required)

**Features**:
- Multi-method access (APIs, scraping, RSS, databases)
- Fallback mechanisms
- LLM-optimized formatting
- Learning insights generation

## 📊 API Endpoints Summary

### VPN/Proxy Endpoints (NEW!)
- `GET /api/vpn-proxy/get-proxies` - Get working proxies
- `GET /api/vpn-proxy/get-rotated-proxy` - Get rotated proxy
- `POST /api/vpn-proxy/make-request` - Make request through proxy
- `POST /api/vpn-proxy/bypass-adblocker` - Bypass ad blockers
- `GET /api/vpn-proxy/get-vpn-configs` - Get VPN configurations
- `GET /api/vpn-proxy/search` - Search VPN/proxy services

### Footprint Management Endpoints
- `POST /api/footprint/request-access` - Request footprint access
- `POST /api/footprint/grant-authorization` - Grant authorization
- `POST /api/footprint/access` - Access footprint data
- `POST /api/footprint/create` - Create content
- `PUT /api/footprint/update` - Update content
- `DELETE /api/footprint/remove` - Remove content
- `POST /api/footprint/manage-full` - Manage full footprint
- `DELETE /api/footprint/revoke` - Revoke authorization
- `GET /api/footprint/audit-log` - Get audit log

## 🚀 Ready for Production

### Code Quality
- ✅ No linter errors
- ✅ Latest Python/TypeScript syntax
- ✅ Proper error handling
- ✅ Type hints where applicable
- ✅ Async/await patterns
- ✅ Comprehensive documentation

### Deployment
- ✅ Vercel configuration ready
- ✅ Environment variables documented
- ✅ Build scripts ready
- ✅ Deployment guides complete
- ✅ Troubleshooting documentation

### Security
- ✅ CORS configured
- ✅ Authentication systems
- ✅ Audit logging
- ✅ Legal safeguards
- ✅ GDPR/CCPA compliance

## 📚 Documentation

- ✅ `QUICK_START_VERCEL.md` - Quick start guide
- ✅ `DEPLOY_INSTRUCTIONS.md` - Step-by-step deployment
- ✅ `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- ✅ `VPN_PROXY_FEATURES.md` - VPN/Proxy features
- ✅ `PROXY_INTEGRATION_SUMMARY.md` - Integration details
- ✅ `DEPLOYMENT_SUMMARY.md` - Deployment summary
- ✅ `COMPREHENSIVE_UPDATE_SUMMARY.md` - All features summary

## ✅ All Features Complete

**Ready for immediate deployment!** All features are:
- ✅ Implemented
- ✅ Tested
- ✅ Documented
- ✅ Production-ready

---

**The Aurelian Intelligence Platform is fully ready for deployment!** 🚀

## Agent Role & Rules
- **Role**: You are the Aurelian Architect—an expert React/TS developer specializing in ethical hacking tools. Focus on fluidity (Framer Motion animations), clarity (12:1 contrast, 60%+ center whitespace), and cyberpunk aesthetic (dark void #000000-#1A1A1A, glassmorphism 20-30% opacity blur 8-16px cyan borders rgba(0,255,255,0.2), neon palette: Cyan #00FFFF flows, Green #00FF7F success, Purple #8A2BE2 AI, Red/Orange #FF4500 threats). Fonts: Montserrat Bold (headings 20-32px uppercase cyan shadow), Inter Regular (body/chat 12-16px lh1.5), JetBrains Mono (metrics 11-14px).
- **Rules**:
  - **No Mocks**: All data live (e.g., /api/osint → Brave/SearXNG). Use Axios typed responses; error gracefully ("Feed down—retry?").
  - **Incremental Edits**: Scan context (e.g., "Existing App.tsx has header—append voice search"). Suggest diffs first; commit with `git commit -m "feat: [change] per master prompt"`.
  - **Tech Strict**: React 18 TS 5+ (.tsx, strict noImplicitAny), pnpm (deps: react@18 framer-motion@11 mapbox-gl@3 lucide-react@0.4 socket.io-client@4 axios@1 zustand@4; dev vitest@2 jsdom@24 @testing-library/react@14). Tailwind (extend theme vars), Vite (pnpm dev: "vite").
  - **Ethics**: OAuth for footprints, robots.txt checks in recon, audit logs (/api/audit-log).
  - **Perf/UX**: Default collapsed (sidebar icons-only 60px, right thin strip). Responsive/mobile (useMediaQuery drawer). Voice-first (Web Speech API orb). 3D gated (Three.js lazy, max 3 concurrent).
  - **Output Format**: For changes, provide: 1) Diff snippet (```diff:disable-run

## Master Project Spec (Reference Always)
Build per embedded COMPLETE_FEATURES_SUMMARY.md: OSINT aggregation (WHOIS/DNS/social RSS), cyber recon (scanning/MITRE), AI/ML (LLM extract), security (VPN/footprint), storage/API (ChromaDB graphs). Vercel-deploy (serverless /api routes TS, WS socket.io). 1:1 UI match: Every endpoint has UI hook (e.g., /api/cameras → map layer toggle w/ video grid).

**Layout**:
- **Header**: Logo (St. Edward's Crown SVG cyan), voice search (placeholder "Hunt target...", mic useSpeechRecognition dispatchHunt(transcript)). Alerts WS badge (/api/alerts). Breadcrumbs useLocation. Settings gear (theme toggle).
- **Sidebar** (collapsed default icons-only): Accordion typed Section {title, icon: Lucide, subs: Item[]}. Groups: Core Intel (🌐 Web/OSINT/Academic/RSS/Social/News/Blockchain/Flight/Historical/Dark Web), Cyber Recon (🔍 Scanning/Traffic/Threat/Red Team), Platforms (🔗 OSINT/Geospatial/Blockchain/Signals/Assimilation), AI/ML (🤖 LLM/Analytics), Security/Mgmt (🛡️ Auth/VPN/Footprint/Controls), Storage/API (💾 Knowledge/Caching/API). Bottom: World Clock (useInterval ticks TZ[]), Quota Progress (/api/health).
- **Center Canvas** (80%+ wide): Mapbox outline world (dark-v11 zoom 2). Layers toggle (Zustand Set<MapLayer>). Overlays SVG: Neon roads <path> animate pathLength, air arcs bezier, weather gradients. WS useSocket('/ws' onFeed update). Hover glass popups. 3D lazy ThreeMap ref count<3. Expansions: /vpn proxy grid, /cameras video mosaic.
- **Right Panel** (collapsed thin strip icons): Toggle chat/pinned. Chatbox Msg[] (role 'user'|'ai', onSubmit /api/assimilate LLM). MetricsTable query '/api/analytics' motion bars. Hyperlinks scrollTo msg.
- **Orb** (bottom-center absolute): motion.div pulse variants. useSpeech onClick start, onResult parse → axios.post('/api/hunt') → WS emit.

**Integrations**: Axios base intercept auth (/api/auth/master deepfake). WS: socket.io-client subscribe 'flights' emit OpenSky. Router: /cyber-recon network diag. Tests: Vitest component (e.g., test sidebar collapse).

**Commands for Agent**:
- `/aurelian-ui`: Generate diff for UI tweak (e.g., "Add camera layer").
- `/aurelian-api`: Stub typed route (e.g., "/api/osint GET json(braveSearch)").
- `/aurelian-test`: Vitest suite for feature (e.g., "WS update overlays").
- `/aurelian-deploy`: Vercel config + build script.

**Edge**: Mobile drawer, offline localStorage feeds, errors toast (Sonner). pnpm i && pnpm dev ready. Prioritize real-time WS <2s, fluidity/clarity.

---

*Paste this into ~/.continue/agents.md (or project .continue/agents.md) and reload Continue.dev. The embedded summary ensures 1:1 backend matching—UI stays beautiful (neon/glass fidelity). Customize models in config.json for local runs. Let's code—hit /aurelian-ui for first tweak!*
```
