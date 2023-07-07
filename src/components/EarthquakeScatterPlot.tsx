import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import chartTrendline from 'chartjs-plugin-trendline';
import { Bar } from 'react-chartjs-2';
import { EarthquakeData } from '../service/earthquakeService.ts';

ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Title,
    chartTrendline,
);

interface IEarthquakeScatterPlotProps {
    data: EarthquakeData[];
    label: string;
    dataValueKey: keyof EarthquakeData;
}

export default function EarthquakeScatterPlot(props: IEarthquakeScatterPlotProps) {
    const options = {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    maxTicksLimit: 8,
                },
            },
        },
        plugins: {
            title: {
                display: true,
                text: props.label,
            },
            legend: {
                display: false
            }
        },
    };

    const data = {
        labels: props.data.map((e) => e.t),
        datasets: [
            {
                data: props.data.map((e) => e[props.dataValueKey]),
                backgroundColor: props.data.map(e => e.color),
                barThickness: 2,
                trendlineLinear: {
                    colorMax: 'rgb(0,0,0)',
                    colorMin: 'rgba(0,0,0,0.7)',
                    lineStyle: 'solid',
                    width: 2,
                    projection: false,
                },
            },
        ],
    };

    return <Bar options={options} data={data} />;
}
