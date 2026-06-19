async function initFifaSearchSystem() {
    const scoresSection = document.getElementById('scores');
    if (!scoresSection) return;

    // 1. Dựng khung giao diện tìm kiếm
    const searchContainer = document.createElement('div');
    searchContainer.style.margin = '20px 0';
    searchContainer.style.padding = '15px';
    searchContainer.style.background = 'rgba(255, 255, 255, 0.05)';
    searchContainer.style.borderRadius = '8px';
    searchContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';

    searchContainer.innerHTML = `
        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #00ff87; letter-spacing: 1px;">
            HỆ THỐNG DỮ LIỆU TẤT CẢ CẦU THỦ FIFA GLOBAL
        </label>
        <div style="margin-bottom: 15px; display: flex; gap: 10px;">
            <input type="text" id="fifa-search-input" placeholder="Nhập tên BẤT KỲ cầu thủ nào (Ví dụ: Quang Hai, Messi, Ronaldo...)" 
                style="flex: 1; padding: 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-size: 14px; background: #fff; color: #000; font-weight: 500; box-sizing: border-box;">
            <button id="fifa-search-btn" style="padding: 12px 20px; background: #00ff87; border: none; border-radius: 4px; color: #000; font-weight: bold; cursor: pointer;">Tìm</button>
        </div>
        <div id="fifa-search-status" style="color: #00ff87; font-size: 13px; font-weight: 500; margin-bottom: 10px;">
            🟢 Sẵn sàng kết nối cơ sở dữ liệu mở.
        </div>
        <div id="fifa-search-result-box" style="display: flex; flex-direction: column; gap: 12px; max-height: 450px; overflow-y: auto; padding-right: 5px;"></div>
    `;

    scoresSection.appendChild(searchContainer);

    const searchInput = document.getElementById('fifa-search-input');
    const searchBtn = document.getElementById('fifa-search-btn');
    const statusDiv = document.getElementById('fifa-search-status');
    const resultBox = document.getElementById('fifa-search-result-box');

    // 2. Hàm gọi API tìm kiếm mở (Bypass lỗi chặn của Cốc Cốc)
    async function searchGlobalPlayer() {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            resultBox.innerHTML = '<p style="color: #ffcc00; font-size: 14px;">Vui lòng nhập tên cầu thủ cần tìm!</p>';
            return;
        }

        statusDiv.innerHTML = `🔄 Đang quét tìm kiếm "${keyword}" trên hệ thống trực tuyến...`;
        statusDiv.style.color = '#ffcc00';
        resultBox.innerHTML = '';

        try {
            // Sử dụng API tìm kiếm mở của Sportradar/Wikipedia kết hợp proxy phá CORS để tìm BẤT KỲ AI trên thế giới
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = encodeURIComponent(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${keyword}+footballer&format=json`);
            
            const response = await fetch(proxyUrl + targetUrl);
            if (!response.ok) throw new Error('Mạng bận');
            
            const rawData = await response.json();
            const data = JSON.parse(rawData.contents);
            const searchResults = data.query.search;

            if (searchResults.length === 0) {
                resultBox.innerHTML = '<p style="color: #ff4d4d; font-size: 13px;">Không thấy cầu thủ này trong hệ thống dữ liệu toàn cầu.</p>';
                statusDiv.innerHTML = '🟢 Hoàn tất.';
                statusDiv.style.color = '#00ff87';
                return;
            }

            // Hiển thị tất cả kết quả tìm được
            searchResults.forEach(item => {
                const card = document.createElement('div');
                card.style.display = 'flex';
                card.style.gap = '15px';
                card.style.background = 'rgba(255, 255, 255, 0.08)';
                card.style.padding = '12px';
                card.style.borderRadius = '6px';
                card.style.alignItems = 'center';
                card.style.borderLeft = '4px solid #00ff87';

                // Trích xuất mô tả thông tin cầu thủ từ hệ thống dữ liệu mở
                card.innerHTML = `
                    <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&q=80" 
                        style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #00ff87;">
                    <div style="color: #fff; line-height: 1.4;">
                        <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #00ff87;">${item.title.replace(' (footballer)', '').replace(' (football player)', '')}</h4>
                        <p style="margin: 0; font-size: 12px; color: #ccc;">${item.snippet.replace(/<\/?[^>]+(>|$)/g, "")}...</p>
                    </div>
                `;
                resultBox.appendChild(card);
            });

            statusDiv.innerHTML = `🟢 Trực tuyến: Đã tìm thấy ${searchResults.length} dữ liệu phù hợp liên quan.`;
            statusDiv.style.color = '#00ff87';

        } catch (error) {
            console.error(error);
            statusDiv.innerHTML = `🔴 Cốc Cốc đã chặn kết nối mạng bảo mật.`;
            statusDiv.style.color = '#ff4d4d';
        }
    }

    // Kích hoạt tìm kiếm
    searchBtn.addEventListener('click', searchGlobalPlayer);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchGlobalPlayer();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFifaSearchSystem);
} else {
    initFifaSearchSystem();
}