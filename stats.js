// =============================================
// STATS FEATURE MODULE
// =============================================

function calculateStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percentage };
}

function renderProgress(tasks) {
  const { total, completed, percentage } = calculateStats(tasks);

  const container = document.getElementById("progressSection");

  container.innerHTML = `
    <div style="margin-top:10px;">
      <div style="font-size:14px; margin-bottom:6px;">
        Progress: ${completed}/${total} tasks completed (${percentage}%)
      </div>
      <div style="height:8px; background:#333; border-radius:6px;">
        <div style="
          width:${percentage}%;
          height:100%;
          background:#7c4dff;
          border-radius:6px;
          transition: width 0.3s ease;
        "></div>
      </div>
    </div>
  `;
}