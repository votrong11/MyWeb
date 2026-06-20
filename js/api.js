document.addEventListener("DOMContentLoaded", () => {
    // KÍCH HOẠT CÁC HỆ THỐNG
    initFifaSearchSystem();
    initLiveScoresSystem();
});

/**
 * 1. HỆ THỐNG DỮ LIỆU TRẬN ĐẤU & BẢNG XẾP HẠNG TRỰC TIẾP
 */
function initLiveScoresSystem() {
    const scoresContainer = document.getElementById("fifa-live-scores");
    const tabButtons = document.querySelectorAll(".league-tab");
    if (!scoresContainer) return;

    // KHÓA API CHÍNH THỨC CỦA BẠN (Quản lý tập trung tại đây)
    const MY_API_KEY = "0989183fa200b3f3307d7998adaf0e94";

    // Tạo container chứa bảng xếp hạng nếu chưa có
    let standingsContainer = document.getElementById("fifa-live-standings");
    if (!standingsContainer) {
        standingsContainer = document.createElement("div");
        standingsContainer.id = "fifa-live-standings";
        standingsContainer.style.marginTop = "30px";
        scoresContainer.parentNode.insertBefore(standingsContainer, scoresContainer.nextSibling);
    }

    const BASE_URL = "https://v3.football.api-sports.io";
    const LIVE_MATCHES_URL = `${BASE_URL}/fixtures?live=all`; 
    
    // Bản đồ ID giải đấu chuẩn theo cơ sở dữ liệu API-Football
    const LEAGUE_IDS = {
        "Premier League": 39,
        "La Liga": 140,
        "World Cup": 1 // ID 1 là mã định danh chuẩn quốc tế của FIFA World Cup trên hệ thống API
    };

    let allMatches = []; 
    let currentFilter = "all"; 

    // Hàm lấy dữ liệu trận đấu trực tiếp
    async function getLiveScores() {
        try {
            const response = await fetch(LIVE_MATCHES_URL, {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': MY_API_KEY,
                    'x-apisports-key': MY_API_KEY
                }
            });
            
            const data = await response.json();
            allMatches = data.response || []; 
            renderMatches();

        } catch (error) {
            console.error("Lỗi đồng bộ API trận đấu:", error);
            scoresContainer.innerHTML = `<div style="color: #ff4d4d; text-align: center; padding: 20px;">Không thể kết nối dữ liệu trực tuyến. Vui lòng kiểm tra lại đường truyền.</div>`;
        }
    }

    // Hàm lấy dữ liệu Bảng xếp hạng trực tiếp (Hỗ trợ Mock Data 2026 cho World Cup)
    async function getLiveStandings(leagueId) {
        
        // KIỂM TRA NẾU LÀ WORLD CUP (ID = 1): Bẫy luồng trả về Mock Data World Cup 2026 ngay lập tức
        if (leagueId === 1) {
            standingsContainer.innerHTML = `<div style="color: #00ff87; text-align: center; padding: 15px;">🔄 Đang tải cơ sở dữ liệu FIFA World Cup 2026 (Bản Mock Data)...</div>`;
            
            // Bộ dữ liệu giả lập World Cup 2026 cấu trúc đa bảng khớp hoàn toàn cấu trúc hàm render của bạn
            const mockWorldCup2026 = [
                [ // MẢNG DỮ LIỆU BẢNG A
                    { rank: 1, team: { name: "United States (Chủ nhà)", logo: "https://media.api-football.com/teams/2384.png" }, all: { played: 3, win: 2, draw: 1, lose: 0 }, goalsDiff: 4, points: 7, group: "MÙA GIẢI 2026 - BẢNG A" },
                    { rank: 2, team: { name: "Mexico (Chủ nhà)", logo: "https://media.api-football.com/teams/2382.png" }, all: { played: 3, win: 2, draw: 0, lose: 1 }, goalsDiff: 2, points: 6, group: "MÙA GIẢI 2026 - BẢNG A" },
                    { rank: 3, team: { name: "Argentina", logo: "https://media.api-football.com/teams/26.png" }, all: { played: 3, win: 1, draw: 1, lose: 1 }, goalsDiff: 1, points: 4, group: "MÙA GIẢI 2026 - BẢNG A" },
                    { rank: 4, team: { name: "Vietnam (Dream)", logo: "https://media.api-football.com/teams/2400.png" }, all: { played: 3, win: 0, draw: 0, lose: 3 }, goalsDiff: -7, points: 0, group: "MÙA GIẢI 2026 - BẢNG A" }
                ],
                [ // MẢNG DỮ LIỆU BẢNG B
                    { rank: 1, team: { name: "France", logo: "https://media.api-football.com/teams/2.png" }, all: { played: 3, win: 3, draw: 0, lose: 0 }, goalsDiff: 6, points: 9, group: "MÙA GIẢI 2026 - BẢNG B" },
                    { rank: 2, team: { name: "England", logo: "https://media.api-football.com/teams/10.png" }, all: { played: 3, win: 1, draw: 1, lose: 1 }, goalsDiff: 0, points: 4, group: "MÙA GIẢI 2026 - BẢNG B" },
                    { rank: 3, team: { name: "Japan", logo: "https://media.api-football.com/teams/2379.png" }, all: { played: 3, win: 1, draw: 1, lose: 1 }, goalsDiff: -1, points: 4, group: "MÙA GIẢI 2026 - BẢNG B" },
                    { rank: 4, team: { name: "Canada (Chủ nhà)", logo: "https://media.api-football.com/teams/2385.png" }, all: { played: 3, win: 0, draw: 0, lose: 3 }, goalsDiff: -5, points: 0, group: "MÙA GIẢI 2026 - BẢNG B" }
                ]
            ];

            // Tạo hiệu ứng bất đồng bộ phản hồi sau 400ms để giống dữ liệu mạng thật
            setTimeout(() => {
                renderStandings(mockWorldCup2026, "FIFA World Cup 2026", 1);
            }, 400); 
            
            return; // Ngắt hàm, không gửi request lên server API-Sports
        }

        // ĐỐI VỚI PREMIER LEAGUE & LA LIGA: Giữ nguyên cơ chế gọi kết nối API thật
        const season = 2023; 
        standingsContainer.innerHTML = `<div style="color: #ffcc00; text-align: center; padding: 15px;">🔄 Đang kết nối trực tiếp đến máy chủ dữ liệu mùa giải ${season}...</div>`;
        
        try {
            const response = await fetch(`${BASE_URL}/standings?league=${leagueId}&season=${season}`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': MY_API_KEY,
                    'x-apisports-key': MY_API_KEY
                }
            });
            
            const data = await response.json();
            console.log("Dữ liệu thô từ API trả về:", data);

            if (data.errors && Object.keys(data.errors).length > 0) {
                standingsContainer.innerHTML = `<div style="color: #ff4d4d; padding: 15px; text-align: center;">Tài khoản API báo lỗi: ${JSON.stringify(data.errors)}</div>`;
                return;
            }

            const leagueObj = data.response?.[0]?.league;
            const standingsData = leagueObj?.standings || [];
            const leagueName = leagueObj?.name || "Giải đấu";

            console.log("Mảng BXH trích xuất được:", standingsData);
            
            if (standingsData.length === 0) {
                standingsContainer.innerHTML = `
                    <div style="color: #94a3b8; text-align: center; padding: 15px; background: #182032; border-radius: 8px;">
                        ⚠️ Máy chủ API phản hồi thành công nhưng danh sách dữ liệu BXH của mùa giải ${season} hiện tại đang trống [🟥]. 
                        <br><span style="font-size: 12px; color: #ffcc00;">(Vui lòng đợi API đồng bộ sau khi loạt trận đấu kết thúc hoặc kiểm tra lại hạn ngạch gói API)</span>
                    </div>`;
                return;
            }

            renderStandings(standingsData, leagueName, leagueId);
        } catch (error) {
            console.error("Lỗi sập luồng BXH:", error);
            standingsContainer.innerHTML = `<div style="color: #ff4d4d; padding: 15px; text-align: center;">Không thể hiển thị bảng xếp hạng do lỗi kết nối phần cứng.</div>`;
        }
    }

    // Hàm dựng giao diện Bảng xếp hạng (Hỗ trợ cấu hình đa bảng đấu của World Cup)
    function renderStandings(standingsData, leagueName, leagueId) {
        if (!standingsData || standingsData.length === 0) {
            standingsContainer.innerHTML = `<div style="color: #94a3b8; text-align: center; padding: 15px;">Bảng xếp hạng giải đấu hiện tại đang được cập nhật cập nhật từ FIFA...</div>`;
            return;
        }

        let standingsHtml = "";

        // Kiểm tra xem đây là giải đấu nhiều bảng (như World Cup) hay đá vòng tròn tính điểm (như Ngoại Hạng Anh)
        const isMultiGroup = Array.isArray(standingsData[0]);

        if (isMultiGroup) {
            // DUYỆT QUA TỪNG BẢNG ĐẤU (Group A, Group B...) CỦA WORLD CUP
            standingsData.forEach(group => {
                const groupName = group[0]?.group || "Bảng Đấu";
                standingsHtml += createTableTemplate(group, groupName);
            });
        } else {
            // ĐỐI VỚI NGOẠI HẠNG ANH / LA LIGA (Chỉ có 1 bảng duy nhất)
            standingsHtml += createTableTemplate(standingsData, "BẢNG XẾP HẠNG CHI TIẾT");
        }

        standingsContainer.innerHTML = `
            <div style="background: #182032; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); color: #fff;">
                <h3 style="margin-top: 0; margin-bottom: 20px; color: #00ff87; font-size: 16px; font-family: 'Montserrat', sans-serif; letter-spacing: 1px;">
                    📊 BẢNG XẾP HẠNG THỜI GIAN THỰC: ${leagueName.toUpperCase()}
                </h3>
                <div style="display: flex; flex-direction: column; gap: 25px;">
                    ${standingsHtml}
                </div>
            </div>
        `;
    }

    // Hàm bổ trợ: Tạo cấu trúc Table chuẩn CSS
    function createTableTemplate(teamsArray, title) {
        let rows = teamsArray.map(team => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px;">
                <td style="padding: 10px; text-align: center; font-weight: bold; color: ${team.rank <= 2 ? '#00ff87' : '#fff'};">${team.rank}</td>
                <td style="padding: 10px; display: flex; align-items: center; gap: 10px;">
                    <img src="${team.team.logo}" style="width: 20px; height: 20px; object-fit: contain;" alt="${team.team.name}">
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; font-weight: 500;">${team.team.name}</span>
                </td>
                <td style="padding: 10px; text-align: center;">${team.all.played}</td>
                <td style="padding: 10px; text-align: center; color: #00ff87;">${team.all.win}</td>
                <td style="padding: 10px; text-align: center; color: #94a3b8;">${team.all.draw}</td>
                <td style="padding: 10px; text-align: center; color: #ff4d4d;">${team.all.lose}</td>
                <td style="padding: 10px; text-align: center; color: #94a3b8;">${team.goalsDiff}</td>
                <td style="padding: 10px; text-align: center; font-weight: bold; color: #00ff87;">${team.points}</td>
            </tr>
        `).join("");

        return `
            <div>
                <h4 style="margin: 0 0 10px 0; color: #ffcc00; font-size: 14px; font-family: 'Montserrat', sans-serif;">👉 ${title}</h4>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 12px;">
                                <th style="padding: 10px; text-align: center; width: 40px;">#</th>
                                <th style="padding: 10px;">Đội Bóng</th>
                                <th style="padding: 10px; text-align: center; width: 40px;">ST</th>
                                <th style="padding: 10px; text-align: center; width: 40px;">T</th>
                                <th style="padding: 10px; text-align: center; width: 40px;">H</th>
                                <th style="padding: 10px; text-align: center; width: 40px;">B</th>
                                <th style="padding: 10px; text-align: center; width: 40px;">HS</th>
                                <th style="padding: 10px; text-align: center; width: 50px;">Điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Hàm lọc dữ liệu trận đấu theo Tab
    function renderMatches() {
        let filteredMatches = allMatches;

        if (currentFilter !== "all") {
            filteredMatches = allMatches.filter(match => {
                const leagueName = match.league.name.toLowerCase();
                const isWorldCup = leagueName.includes("world cup");
                const isPremierLeague = leagueName.includes("premier league") || leagueName.includes("ngoại hạng anh");
                const isLaLiga = leagueName.includes("la liga") || leagueName.includes("primera division");

                if (currentFilter === "World Cup") return isWorldCup;
                if (currentFilter === "Premier League") return isPremierLeague;
                if (currentFilter === "La Liga") return isLaLiga;
                if (currentFilter === "others") {
                    return !isWorldCup && !isPremierLeague && !isLaLiga;
                }
                return false;
            });
        }

        if (filteredMatches.length === 0) {
            let displayTabName = currentFilter;
            if (currentFilter === 'all') displayTabName = 'bóng đá';
            if (currentFilter === 'others') displayTabName = 'giải đấu khác';

            scoresContainer.innerHTML = `
                <div style="color: #94a3b8; text-align: center; padding: 30px; background: #182032; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    Hiện tại chưa có trận đấu nào của giải <span style="color: #00ff87; font-weight: bold;">${displayTabName}</span> đang diễn ra trực tiếp.
                    <br><span style="color: #94a3b8; font-size: 13px; opacity: 0.7;">Hệ thống đang giữ cổng kết nối an toàn chờ trận đấu tiếp theo...</span>
                </div>
            `;
            return;
        }

        scoresContainer.innerHTML = ""; 

        filteredMatches.forEach(match => {
            const status = match.fixture.status.short; 
            const elapsedMinute = match.fixture.status.elapsed || 0; 
            const homeTeam = match.teams.home;
            const awayTeam = match.teams.away;
            const homeGoals = match.goals.home !== null ? match.goals.home : "-";
            const awayGoals = match.goals.away !== null ? match.goals.away : "-";

            let homeEventsHtml = "";
            let awayEventsHtml = "";
            
            if (match.events) {
                match.events.forEach(ev => {
                    let icon = "⚽";
                    if (ev.type === "Card" && ev.detail === "Yellow Card") icon = "🟨";
                    if (ev.type === "Card" && ev.detail === "Red Card") icon = "🟥";
                    const text = `<div style="font-size: 11px; color: #a0aec0; margin-top: 2px;">${ev.player.name || 'Cầu thủ'} ${ev.time.elapsed}' ${icon}</div>`;
                    if (ev.team.id === homeTeam.id) homeEventsHtml += text;
                    else if (ev.team.id === awayTeam.id) awayEventsHtml += text;
                });
            }

            const matchHtml = `
                <div class="wc-match-card ${status === 'LIVE' ? 'live' : ''}" style="margin-bottom: 20px; background: #182032; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                  <div class="wc-match-meta" style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px;">
                    <span class="wc-live-badge" style="color: #00ff87; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                        <span class="live-dot" style="width: 8px; height: 8px; background: #ff0055; border-radius: 50%; display: inline-block; animation: blink 1s infinite;"></span> 
                        TRỰC TIẾP
                    </span>
                    <span class="wc-match-time" style="color: #94a3b8;">${match.league.name} — Phút ${elapsedMinute}'</span>
                  </div>
                  
                  <div class="wc-match-body">
                    <div class="wc-team-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <div class="wc-team-info" style="display: flex; align-items: center; gap: 10px;">
                        <img src="${homeTeam.logo}" class="fifa-flag-img" alt="${homeTeam.name}" style="width: 25px; height: 25px; object-fit: contain;">
                        <span class="wc-team-name" style="font-weight: 500;">${homeTeam.name}</span>
                      </div>
                      <span class="score" style="font-size: 20px; font-weight: bold; color: #00ff87;">${homeGoals}</span>
                    </div>
                    <div class="fifa-events-row" style="margin-bottom: 10px; padding-left: 35px;">${homeEventsHtml}</div>
                    
                    <div class="wc-team-row" style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; margin-bottom: 8px;">
                      <div class="wc-team-info" style="display: flex; align-items: center; gap: 10px;">
                        <img src="${awayTeam.logo}" class="fifa-flag-img" alt="${awayTeam.name}" style="width: 25px; height: 25px; object-fit: contain;">
                        <span class="wc-team-name" style="font-weight: 500;">${awayTeam.name}</span>
                      </div>
                      <span class="score" style="font-size: 20px; font-weight: bold; color: #00ff87;">${awayGoals}</span>
                    </div>
                    <div class="fifa-events-row" style="padding-left: 35px;">${awayEventsHtml}</div>
                  </div>
                  
                  <div class="wc-match-footer" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; color: #94a3b8;">
                    ${match.league.round} • Sân vận động: ${match.fixture.venue.name || 'Quốc tế'}
                  </div>
                </div>
            `;
            scoresContainer.insertAdjacentHTML('beforeend', matchHtml);
        });
    }

    // Lắng nghe sự kiện click Tab giải đấu
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const activeTab = document.querySelector(".league-tab.active");
            if (activeTab) activeTab.classList.remove("active");
            button.classList.add("active");

            currentFilter = button.getAttribute("data-league");
            
            renderMatches(); 

            if (LEAGUE_IDS[currentFilter]) {
                getLiveStandings(LEAGUE_IDS[currentFilter]);
            } else {
                standingsContainer.innerHTML = "";
            }
        });
    });

    getLiveScores();
    setInterval(getLiveScores, 30000);
}

/**
 * 2. HỆ THỐNG TÌM KIẾM CẦU THỦ TOÀN CẦU (FIFA GLOBAL SEARCH)
 */
function initFifaSearchSystem() {
    const scoresSection = document.getElementById('scores');
    if (!scoresSection) return;
    if (document.getElementById('fifa-search-input')) return;

    const searchContainer = document.createElement('div');
    searchContainer.style.margin = '20px 0 30px 0';
    searchContainer.style.padding = '20px';
    searchContainer.style.background = '#182032';
    searchContainer.style.borderRadius = '12px';
    searchContainer.style.border = '1px solid rgba(255, 255, 255, 0.05)';

    searchContainer.innerHTML = `
        <label style="display: block; margin-bottom: 12px; font-weight: bold; color: #00ff87; letter-spacing: 1px; font-family: 'Montserrat', sans-serif; font-size: 14px;">
            HỆ THỐNG TRA CỨU CẦU THỦ FIFA GLOBAL
        </label>
        <div style="margin-bottom: 15px; display: flex; gap: 10px;">
            <input type="text" id="fifa-search-input" placeholder="Nhập tên cầu thủ (Ví dụ: Quang Hai, Messi, Ronaldo...)" 
                style="flex: 1; padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); font-size: 14px; background: #0e131f; color: #fff; font-weight: 500; box-sizing: border-box;">
            <button id="fifa-search-btn" style="padding: 12px 24px; background: #00ff87; border: none; border-radius: 6px; color: #0e131f; font-weight: bold; cursor: pointer; transition: opacity 0.2s;">Tìm</button>
        </div>
        <div id="fifa-search-status" style="color: #00ff87; font-size: 13px; font-weight: 500; margin-bottom: 10px;">
            🟢 Cổng kết nối cơ sở dữ liệu mở đã sẵn sàng.
        </div>
        <div id="fifa-search-result-box" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 5px;"></div>
    `;

    scoresSection.insertBefore(searchContainer, scoresSection.querySelector('.scores-container'));

    const searchInput = document.getElementById('fifa-search-input');
    const searchBtn = document.getElementById('fifa-search-btn');
    const statusDiv = document.getElementById('fifa-search-status');
    const resultBox = document.getElementById('fifa-search-result-box');

    async function searchGlobalPlayer() {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            resultBox.innerHTML = '<p style="color: #ffcc00; font-size: 14px; margin: 0;">Vui lòng nhập tên cầu thủ cần tìm!</p>';
            return;
        }

        statusDiv.innerHTML = `🔄 Đang quét dữ liệu tìm kiếm "${keyword}" trên hệ thống trực tuyến...`;
        statusDiv.style.color = '#ffcc00';
        resultBox.innerHTML = '';

        try {
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = encodeURIComponent(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${keyword}+footballer&format=json`);
            
            const response = await fetch(proxyUrl + targetUrl);
            if (!response.ok) throw new Error('Mạng bận');
            
            const rawData = await response.json();
            const data = JSON.parse(rawData.contents);
            const searchResults = data.query.search;

            if (searchResults.length === 0) {
                resultBox.innerHTML = '<p style="color: #ff4d4d; font-size: 13px; margin: 0;">Không thấy cầu thủ này trong cơ sở dữ liệu toàn cầu.</p>';
                statusDiv.innerHTML = '🟢 Hoàn tất.';
                statusDiv.style.color = '#00ff87';
                return;
            }

            searchResults.forEach(item => {
                const card = document.createElement('div');
                card.style.display = 'flex';
                card.style.gap = '15px';
                card.style.background = 'rgba(255, 255, 255, 0.03)';
                card.style.padding = '12px';
                card.style.borderRadius = '8px';
                card.style.alignItems = 'center';
                card.style.borderLeft = '4px solid #00ff87';

                card.innerHTML = `
                    <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&q=80" 
                        style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #00ff87; flex-shrink: 0;">
                    <div style="color: #fff; line-height: 1.4;">
                        <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #00ff87;">${item.title.replace(' (footballer)', '').replace(' (football player)', '')}</h4>
                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">${item.snippet.replace(/<\/?[^>]+(>|$)/g, "")}...</p>
                    </div>
                `;
                resultBox.appendChild(card);
            });

            statusDiv.innerHTML = `🟢 Trực tuyến: Đã đồng bộ thành công ${searchResults.length} dữ liệu phù hợp liên quan.`;
            statusDiv.style.color = '#00ff87';

        } catch (error) {
            console.error(error);
            statusDiv.innerHTML = `🔴 Lỗi kết nối mạng bảo mật hoặc bị trình duyệt chặn CORS.`;
            statusDiv.style.color = '#ff4d4d';
        }
    }

    searchBtn.addEventListener('click', searchGlobalPlayer);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchGlobalPlayer();
    });
}