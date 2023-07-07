import {
    BarElement,
    CategoryScale,
    Chart as ChartJS, ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import chartTrendline from 'chartjs-plugin-trendline';
import 'chartjs-adapter-moment';
import { Scatter } from 'react-chartjs-2';
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
    TimeScale,
    chartTrendline,
);

interface IEarthquakeScatterPlotProps {
    data: EarthquakeData[];
    label: string;
    dataValueKey: keyof EarthquakeData;
}

export default function EarthquakeScatterPlot(props: IEarthquakeScatterPlotProps) {
    const options: ChartOptions<'scatter'> = {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'hour',
                    displayFormats: {
                        hour: 'dddd - ha',
                    },
                },
            },
        },
        plugins: {
            title: {
                display: true,
                text: props.label,
            },
            legend: {
                display: false,
            },
        },
    };

    const data = {
        datasets: [
            {
                data: props.data.map((e) => ({
                    x: e.t,
                    y: e[props.dataValueKey],
                })),
                backgroundColor: props.data.map((e) => e.color),
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

    return <Scatter options={options} data={data} />;
}
