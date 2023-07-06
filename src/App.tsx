import React, { useEffect, useState } from 'react';
import { Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Layout from './components/Layout.tsx';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Map from './components/Map.tsx';
import earthquakeService, { EarthquakeData } from './service/earthquakeService.ts';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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

const CustomCard = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    dropShadow: theme.shadows,
}));

function App() {
    const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
    const [hoursSinceEarthquake, setHoursSinceEarthquake] = useState(TIMESPAN_48H);

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

    useEffect(() => {
        const fetchData = async () => {
            const data = await earthquakeService.getEarthquakes();
            const filtered = data.filter((earthquake) => {
                const hours = getHoursSinceEarthquake(earthquake);
                return hoursSinceEarthquake > hours;
            });
            setEarthquakes(filtered);
        };

        fetchData().catch((e) => console.log(e));

        const interval = setInterval(() => fetchData().catch((e) => console.log(e)), 120000);

        return () => {
            clearInterval(interval);
        };
    }, [hoursSinceEarthquake]);

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
        return earthquake.s * 2 + 2;
    };

    const markers = earthquakes.map((earthquake) => ({
        ...earthquake,
        color: resolveColor(earthquake),
        radius: resolveRadius(earthquake),
    }));

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
                    <Grid xs={12} display='flex' justifyContent='center'>
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
                    <Grid xs={12}>
                        <CustomCard>
                            <Map markers={markers} />
                            <Stack
                                margin={{ xs: 1, sm: 2 }}
                                spacing={{ xs: 1, sm: 2 }}
                                direction='row'
                            >
                                {createLegendItem(LEGEND_COLOR_1, '< 4h')}
                                {createLegendItem(LEGEND_COLOR_2, '4h - 12h')}
                                {createLegendItem(LEGEND_COLOR_3, '12h - 24h')}
                                {createLegendItem(LEGEND_COLOR_4, '24h - 36h')}
                                {createLegendItem(LEGEND_COLOR_5, '36h - 48h')}
                            </Stack>
                        </CustomCard>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}

export default App;
