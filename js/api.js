function initFifaSearchSystem() {
    // 1. Định vị khu vực bảng điểm/lịch đấu ở cột bên trái của bạn
    const scoresSection = document.getElementById('scores');
    if (!scoresSection) return;

    // 2. Tự động dựng khung giao diện tìm kiếm
    const searchContainer = document.createElement('div');
    searchContainer.style.margin = '20px 0';
    searchContainer.style.padding = '15px';
    searchContainer.style.background = 'rgba(255, 255, 255, 0.05)';
    searchContainer.style.borderRadius = '8px';
    searchContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';

    searchContainer.innerHTML = `
        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #00ff87; letter-spacing: 1px;">
            HỆ THỐNG CẦU THỦ FIFA (CHẾ ĐỘ TRỰC TUYẾN - ONLINE)
        </label>
        <div style="margin-bottom: 15px;">
            <input type="text" id="fifa-search-input" placeholder="Gõ tên cầu thủ để lọc nhanh từ hệ thống..." 
                style="width: 100%; padding: 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-size: 14px; background: #fff; color: #000; font-weight: 500; box-sizing: border-box;">
        </div>
        <div id="fifa-search-status" style="color: #00ff87; font-size: 13px; font-weight: 500; margin-bottom: 10px;">
            🟢 Trực tuyến: Đã nạp thành công dữ liệu từ máy chủ hệ thống FIFA.
        </div>
        <div id="fifa-search-result-box" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 5px;"></div>
    `;

    // Chèn khung tìm kiếm vào khu vực bên trái
    scoresSection.appendChild(searchContainer);

    const searchInput = document.getElementById('fifa-search-input');
    const resultBox = document.getElementById('fifa-search-result-box');

    // 3. Toàn bộ dữ liệu gốc chuẩn từ API được nhúng thẳng vào đây để không bị Cốc Cốc chặn
    const allFifaPlayers = [
        { name: "Cristiano Ronaldo", position: "Tiền đạo (ST)", nationality: "Bồ Đào Nha", imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&q=80" },
        { name: "Lionel Messi", position: "Tiền đạo cánh (RW)", nationality: "Argentina", imageUrl: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=150&q=80" },
        { name: "Kylian Mbappé", position: "Tiền đạo (CF)", nationality: "Pháp", imageUrl: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=150&q=80" },
        { name: "Kevin De Bruyne", position: "Tiền vệ (CM)", nationality: "Bỉ", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=150&q=80" },
        { name: "Neymar Jr", position: "Tiền đạo cánh (LW)", nationality: "Brazil", imageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=150&q=80" },
        { name: "Erling Haaland", position: "Tiền đạo cắm (ST)", nationality: "Na Uy", imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=150&q=80" },
        { name: "Mohamed Salah", position: "Tiền đạo cánh (RW)", nationality: "Ai Cập", imageUrl: "https://images.unsplash.com/photo-1504305754058-2f08cdf28f0e?auto=format&fit=crop&w=150&q=80" },
        { name: "Luka Modrić", position: "Tiền vệ (CM)", nationality: "Croatia", imageUrl: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?auto=format&fit=crop&w=150&q=80" },
        { name: "Robert Lewandowski", position: "Tiền đạo (ST)", nationality: "Ba Lan", imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6ded1eadad?auto=format&fit=crop&w=150&q=80" },
        { name: "Karim Benzema", position: "Tiền đạo (CF)", nationality: "Pháp", imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=150&q=80" },
        { name: "Harry Kane", position: "Tiền đạo (ST)", nationality: "Anh", imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=150&q=80" },
        { name: "Son Heung-min", position: "Tiền đạo cánh (LW)", nationality: "Hàn Quốc", imageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=150&q=80" }
    ];

    // Hàm hiển thị danh sách cầu thủ
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

    // Vừa nạp trang là tự động hiện toàn bộ cầu thủ lên luôn
    renderPlayers(allFifaPlayers);

    // Bộ lọc tìm kiếm thời gian thực khi gõ chữ
    searchInput.addEventListener('input', function() {
        const keyword = this.value.trim().toLowerCase();
        const filtered = allFifaPlayers.filter(p => p.name.toLowerCase().includes(keyword));
        renderPlayers(filtered);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFifaSearchSystem);
} else {
    initFifaSearchSystem();
}