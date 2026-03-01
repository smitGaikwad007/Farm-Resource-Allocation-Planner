const ChartBuilder = {
    // Builds a simple CSS-based Bar Chart
    createBarChart(containerId, dataArray, maxVal, valueLabel) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';

        if (dataArray.length === 0) {
            container.innerHTML = '<p class="text-muted">No data available for chart.</p>';
            return;
        }

        dataArray.forEach(item => {
            const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
            const barWrapper = document.createElement('div');
            barWrapper.style.display = 'flex';
            barWrapper.style.alignItems = 'center';
            barWrapper.style.gap = '15px';

            const labelObj = document.createElement('div');
            labelObj.style.width = '100px';
            labelObj.style.color = 'white';
            labelObj.style.fontSize = '0.9rem';
            labelObj.textContent = item.label;

            const track = document.createElement('div');
            track.style.flex = '1';
            track.style.background = 'rgba(255,255,255,0.1)';
            track.style.height = '20px';
            track.style.borderRadius = '10px';
            track.style.overflow = 'hidden';
            track.style.position = 'relative';

            const fill = document.createElement('div');
            fill.style.width = `${pct}%`;
            fill.style.background = item.color || 'var(--primary-color)';
            fill.style.height = '100%';
            fill.style.transition = 'width 1s ease-out';

            track.appendChild(fill);

            const valueObj = document.createElement('div');
            valueObj.style.width = '80px';
            valueObj.style.textAlign = 'right';
            valueObj.style.color = 'var(--text-muted)';
            valueObj.style.fontSize = '0.9rem';
            valueObj.textContent = valueLabel === '$' ? `$${item.value.toLocaleString()}` : `${item.value.toLocaleString()} ${valueLabel}`;

            barWrapper.appendChild(labelObj);
            barWrapper.appendChild(track);
            barWrapper.appendChild(valueObj);
            container.appendChild(barWrapper);
        });
    },

    // Builds a CSS conic-gradient Pie Chart
    createPieChart(containerId, dataArray) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.gap = '2rem';
        container.style.flexWrap = 'wrap';

        const total = dataArray.reduce((acc, curr) => acc + curr.value, 0);

        if (total === 0 || dataArray.length === 0) {
            container.innerHTML = '<p class="text-muted">No data available for chart.</p>';
            return;
        }

        let gradientStops = [];
        let currentPct = 0;

        const legend = document.createElement('div');
        legend.style.display = 'flex';
        legend.style.flexDirection = 'column';
        legend.style.gap = '0.5rem';

        dataArray.forEach(item => {
            const pct = (item.value / total) * 100;
            gradientStops.push(`${item.color} ${currentPct}% ${currentPct + pct}%`);
            currentPct += pct;

            const legItem = document.createElement('div');
            legItem.style.display = 'flex';
            legItem.style.alignItems = 'center';
            legItem.style.gap = '8px';
            legItem.style.color = 'white';
            legItem.style.fontSize = '0.9rem';

            const swatch = document.createElement('div');
            swatch.style.width = '15px';
            swatch.style.height = '15px';
            swatch.style.background = item.color;
            swatch.style.borderRadius = '3px';

            const text = document.createElement('span');
            text.textContent = `${item.label} (${Math.round(pct)}%)`;

            legItem.appendChild(swatch);
            legItem.appendChild(text);
            legend.appendChild(legItem);
        });

        const pie = document.createElement('div');
        pie.style.width = '200px';
        pie.style.height = '200px';
        pie.style.borderRadius = '50%';
        pie.style.background = `conic-gradient(${gradientStops.join(', ')})`;
        pie.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';

        container.appendChild(pie);
        container.appendChild(legend);
    }
};
