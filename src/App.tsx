import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Layout from './components/Layout.tsx';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Map from './components/Map.tsx';
import earthquakeService, { EarthquakeData } from './service/earthquakeService.ts';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import EarthquakeScatterPlot from './components/EarthquakeScatterPlot.tsx';

const LEGEND_COLOR_1 = '#FF0000';
const LEGEND_COLOR_2 = 'rgba(255,128,0,0.7)';
const LEGEND_COLOR_3 = 'rgba(71,161,0,0.6)';
const LEGEND_COLOR_4 = 'rgba(66,166,246,0.5)';
const LEGEND_COLOR_5 = 'rgba(0,64,147,0.4)';

const TIMESPAN_4H = 4;
const TIMESPAN_12H = 12;
const TIMESPAN_24H = 24;
const TIMESPAN_36H = 36;
const TIMESPAN_48H = 48;

interface ChartOption {
    key: keyof EarthquakeData;
    label: string;
}

const CHART_OPTIONS: ChartOption[] = [
    { key: 's', label: 'Strength' },
    { key: 'dep', label: 'Depth' },
    { key: 'q', label: 'Quality' },
];

function App() {
    const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
    const [hoursSinceEarthquake, setHoursSinceEarthquake] = useState(TIMESPAN_48H);
    const [chartOption, setChartOption] = useState<ChartOption>(CHART_OPTIONS[0]);
    const [minQuality] = useState<number>(0);

    const handleHoursSinceEarthquakeChange = (
        _1: React.MouseEvent<HTMLElement>,
        newTimespan: number,
    ) => {
        setHoursSinceEarthquake(newTimespan);
    };

    const hoursSinceEarthquakeControl = {
        value: hoursSinceEarthquake,
        onChange: handleHoursSinceEarthquakeChange,
        exclusive: true,
    };

    const handleChartOptionChange = (
        _1: React.MouseEvent<HTMLElement>,
        newChartOption: ChartOption,
    ) => {
        setChartOption(newChartOption);
    };

    const chartOptionControl = {
        value: chartOption,
        onChange: handleChartOptionChange,
        exclusive: true,
    };

    useEffect(() => {
        const hoursSinceEarthquakeFilter = (earthquake: EarthquakeData) => {
            const hours = getHoursSinceEarthquake(earthquake);
            return hoursSinceEarthquake > hours;
        };

        const qualityFilter = (earthquake: EarthquakeData) => {
            return parseFloat(earthquake.q) > minQuality;
        };

        const fetchData = async () => {
            const data = await earthquakeService.getEarthquakes();
            const filtered = data.filter(hoursSinceEarthquakeFilter).filter(qualityFilter);
            setEarthquakes(filtered);
        };

        fetchData().catch((e) => console.log(e));

        const interval = setInterval(() => fetchData().catch((e) => console.log(e)), 120000);

        return () => {
            clearInterval(interval);
        };
    }, [hoursSinceEarthquake, minQuality]);

    function getHoursSinceEarthquake(earthquake: EarthquakeData) {
        const earthquakeDate = new Date(earthquake.t);
        const now = new Date();

        return Math.abs(now.getTime() - earthquakeDate.getTime()) / 36e5;
    }

    const resolveColor = (earthquake: EarthquakeData): string => {
        const hours = getHoursSinceEarthquake(earthquake);

        if (hours <= 4) {
            return LEGEND_COLOR_1;
        } else if (hours <= 12) {
            return LEGEND_COLOR_2;
        } else if (hours <= 24) {
            return LEGEND_COLOR_3;
        } else if (hours <= 36) {
            return LEGEND_COLOR_4;
        } else {
            return LEGEND_COLOR_5;
        }
    };

    const resolveRadius = (earthquake: EarthquakeData): number => {
        return parseFloat(earthquake.s) * 2 + 2;
    };

    const markers = earthquakes.map((earthquake) => ({
        ...earthquake,
        lon: parseFloat(earthquake.lon),
        lat: parseFloat(earthquake.lat),
        color: resolveColor(earthquake),
        radius: resolveRadius(earthquake),
        popupContent: ReactDOMServer.renderToString(
            <div>
                <div style={{ textAlign: 'center', fontSize: '16px' }}>
                    <b>{earthquake.s}</b>
                </div>
                <h4>{earthquake.t}</h4>
                <hr style={{ margin: '0.25rem 0' }} />
                <div
                    style={{ textAlign: 'center' }}
                >{`[${earthquake.lat}, ${earthquake.lon}]`}</div>
            </div>,
        ),
    }));

    const scatterPlotData = earthquakes
        .map((earthquake) => ({
            ...earthquake,
            color: resolveColor(earthquake),
        }))
        .reverse();

    const createLegendItem = (color: string, text: string) => (
        <Stack spacing={1} direction='row' alignItems='center' justifyContent='center'>
            <Box
                sx={{
                    width: 16,
                    height: 16,
                    backgroundColor: color,
                }}
            />
            <Typography variant='subtitle2'>{text}</Typography>
        </Stack>
    );

    return (
        <Layout>
            <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
                <Grid container spacing={2}>
                    <Grid xs={12} xl={6}>
                        <Grid xs={12} display='flex' justifyContent='center' mb={2}>
                            <ToggleButtonGroup size='small' {...hoursSinceEarthquakeControl}>
                                {[
                                    TIMESPAN_4H,
                                    TIMESPAN_12H,
                                    TIMESPAN_24H,
                                    TIMESPAN_36H,
                                    TIMESPAN_48H,
                                ].map((v) => (
                                    <ToggleButton key={v} value={v}>
                                        {v + ' hours'}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Grid>
                        <Map markers={markers} />
                        <Stack margin={{ xs: 1, sm: 2 }} spacing={{ xs: 1, sm: 2 }} direction='row'>
                            {createLegendItem(LEGEND_COLOR_1, '< 4h')}
                            {createLegendItem(LEGEND_COLOR_2, '4h - 12h')}
                            {createLegendItem(LEGEND_COLOR_3, '12h - 24h')}
                            {createLegendItem(LEGEND_COLOR_4, '24h - 36h')}
                            {createLegendItem(LEGEND_COLOR_5, '36h - 48h')}
                        </Stack>
                    </Grid>
                    <Grid xs={12} xl={6}>
                        <Grid xs={12} display='flex' justifyContent='center' mb={2}>
                            <ToggleButtonGroup size='small' {...chartOptionControl}>
                                {CHART_OPTIONS.map((v) => (
                                    <ToggleButton key={v.key} value={v}>
                                        {v.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Grid>
                        <EarthquakeScatterPlot
                            label={chartOption.label}
                            dataValueKey={chartOption.key}
                            data={scatterPlotData}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}

export default App;
