$(document).ready(function () {
    // 1. Initial DataTable
    const table = $('#table1').DataTable({
        ajax: {
            url: '/mission/mission-list', // Path ของ API คุณ
            dataSrc: 'data' // บอกว่าข้อมูลจริงอยู่ที่ field 'data'
        },
        order: [[0, 'desc']],
        columns: [
            { data: 'createdAt', render: (data) => new Date(data).toLocaleString('th-TH') },
            { data: 'name' },
            { data: 'droneName' },
            { data: 'aiStatus', render: (data) => renderAiStatusBadge(data) },
            { data: 'pushStatus', render: (data) => renderPushStatusBadge(data) },
            { data: '_count.hotspots' },
            {
                data: 'id',
                render: (id) => {
                    return `
                        <div class="btn-group">
                            <a href="/mission/${id}" class="btn btn-sm btn-outline-primary">
                                <i class="bi bi-eye"></i> View
                            </a>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteMission('${id}')" title="Delete">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    `;
                }
            }
        ]
    });

    // 2. ตั้งเวลาให้โหลดข้อมูลใหม่ทุกๆ 10 วินาที (Polling)
    setInterval(() => {
        // false หมายถึงให้ reload โดยที่ยังค้างหน้าเดิมไว้ (ถ้า User อยู่หน้า 2 ก็จะไม่เด้งกลับหน้า 1)
        table.ajax.reload(null, false);
    }, 10000);
});

function renderAiStatusBadge(status) {
    const colors = {
        'PENDING': 'warning',
        'CAPTURING': 'primary',
        'WAITING_AI': 'warning',
        'AI_PROCESSING': 'primary',
        'COMPLETED': 'success',
        'FAILED': 'danger',
    };
    return `<span class="badge bg-${colors[status] || 'secondary'}">${status}</span>`;
}

function renderPushStatusBadge(status) {
    const colors = {
        'IDLE': 'secondary',
        'PENDING': 'warning',
        'PUSHING': 'primary',
        'PUSHED': 'success',
        'FAILED': 'danger',
    };
    return `<span class="badge bg-${colors[status] || 'secondary'}">${status}</span>`;
}

window.deleteMission = function (id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภารกิจนี้?')) {
        fetch(`/mission/${id}/delete`, { method: 'DELETE' })
            .then(() => $('#table1').DataTable().ajax.reload());
    }
}
