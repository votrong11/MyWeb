async function initFifaSearchSystem() {
    // 1. Định vị khu vực bảng điểm/lịch đấu ở cột bên trái
    const scoresSection = document.getElementById('scores');
    if (!scoresSection) return;

    // 2. Dựng khung giao diện tìm kiếm
    const searchContainer = document.createElement('div');
    searchContainer.style.margin = '20px 0';
    searchContainer.style.padding = '15px';
    searchContainer.style.background = 'rgba(255, 255, 255, 0.05)';
    searchContainer.style.borderRadius = '8px';
    searchContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';

    searchContainer.innerHTML = `
        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #00ff87; letter-spacing: 1px;">
            HỆ THỐNG CẦU THỦ FIFA (DỮ LIỆU ONLINE THỰC TẾ)
        </label>
        <div style="margin-bottom: 15px;">
            <input type="text" id="fifa-search-input" placeholder="Gõ tên cầu thủ để lọc nhanh từ API..." 
                style="width: 100%; padding: 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-size: 14px; background: #fff; color: #000; font-weight: 500; box-sizing: border-box;">
        </div>
        <div id="fifa-search-status" style="color: #00ff87; font-size: 13px; font-weight: 500; margin-bottom: 10px;">
            🔄 Đang tải dữ liệu trực tuyến từ máy chủ FIFA...
        </div>
        <div id="fifa-search-result-box" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 5px;"></div>
    `;

    scoresSection.appendChild(searchContainer);

    const searchInput = document.getElementById('fifa-search-input');
    const statusDiv = document.getElementById('fifa-search-status');
    const resultBox = document.getElementById('fifa-search-result-box');

    let allFifaPlayers = []; 

    // Hàm vẽ giao diện danh sách cầu thủ
    function renderPlayers(playersList) {
        resultBox.innerHTML = '';
        if (playersList.length > 0) {
            playersList.forEach(player => {
                const card = document.createElement('div');
                card.style.display = 'flex';
                card.style.gap = '15px';
                card.style.background = 'rgba(255, 255, 255, 0.08)';
                card.style.padding = '12px';
                card.style.borderRadius = '6px';
                card.style.alignItems = 'center';
                card.style.borderLeft = '4px solid #00ff87';

                card.innerHTML = `
                    <img src="${player.imageUrl}" alt="${player.name}" 
                        style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #00ff87;"
                        onerror="this.onerror=null; this.src='../img/3921.jpg';">
                    <div style="color: #fff; line-height: 1.4;">
                        <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #00ff87;">${player.name}</h4>
                        <p style="margin: 0; font-size: 12px; color: #ddd;"><b>Vị trí:</b> ${player.position}</p>
                        <p style="margin: 0; font-size: 12px; color: #ddd;"><b>Quốc tịch:</b> ${player.nationality}</p>
                    </div>
                `;
                resultBox.appendChild(card);
            });
        } else {
            resultBox.innerHTML = '<p style="color: #ff4d4d; font-size: 13px;">Không tìm thấy cầu thủ nào phù hợp.</p>';
        }
    }

    try {
        // GỌI API LẤY DỮ LIỆU GỐC TRÊN INTERNET
        const response = await fetch('https://thongtinjve.github.io/mock-api/fifa-players.json');
        if (!response.ok) throw new Error('Máy chủ bận');

        allFifaPlayers = await response.json(); 

        // Đổi trạng thái sang màu xanh khi Cốc Cốc kết nối thành công
        statusDiv.innerHTML = `🟢 Trực tuyến: Đã nạp thành công ${allFifaPlayers.length} cầu thủ từ API FIFA.`;
        statusDiv.style.color = '#00ff87';

        // Hiển thị toàn bộ ngay từ ban đầu
        renderPlayers(allFifaPlayers);

        // Bộ lọc khi gõ chữ tìm kiếm
        searchInput.addEventListener('input', function() {
            const keyword = this.value.trim().toLowerCase();
            const filtered = allFifaPlayers.filter(p => p.name.toLowerCase().includes(keyword));
            renderPlayers(filtered);
        });

    } catch (error) {
        console.error(error);
        statusDiv.innerHTML = `🔴 Ngoại tuyến: Cốc Cốc đang chặn kết nối mạng (Hãy dán link Live Server vào đây).`;
        statusDiv.style.color = '#ff4d4d';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFifaSearchSystem);
} else {
    initFifaSearchSystem();
}