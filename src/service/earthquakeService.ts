import axios from 'axios';

type EarthquakeRawData = {
    t: string;
    a: string;
    lat: number;
    lon: number;
    dep: number;
    q: number;
    s: number;
};

export type EarthquakeData = EarthquakeRawData & {
    id: string;
};

async function getEarthquakes(): Promise<EarthquakeData[]> {
    const url = 'https://corsproxy.io/?' + encodeURIComponent('https://en.vedur.is/earthquakes-and-volcanism/earthquakes#view=table');

    return axios
        .get(url)
        .then((response) => {
            const html = response.data;
            const regex = /VI\.quakeInfo = (\[.*?\]);/; // Regular expression to match the variable assignment
            const match = html.match(regex);

            if (match && match.length >= 2) {
                const quakeInfoJsonRaw = match[1];
                const jsonString = quakeInfoJsonRaw.replace(
                    /new Date\((.*?)\)/g,
                    (_1: never, dateArgs: string) => {
                        const [year, month, day, hours, minutes, seconds] = dateArgs
                            .split(',')
                            .map((arg: string) => parseInt(arg));
                        const date = new Date(
                            Date.UTC(year, month - 1, day, hours, minutes, seconds),
                        );

                        return `'${date.toUTCString()}'`;
                    },
                );

                const data: EarthquakeRawData[] = JSON.parse(jsonString.replace(/'/g, '"'));

                return data.map((data: EarthquakeRawData) => ({
                    ...data,
                    id: `${new Date(data.t).toISOString()}-${data.lat}`,
                } as EarthquakeData));
            } else {
                console.warn('Quake info not found.');
                return [];
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            return [];
        });
}

export default {
    getEarthquakes,
};
