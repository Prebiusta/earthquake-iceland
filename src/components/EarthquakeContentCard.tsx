import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { EarthquakeData } from '../service/earthquakeService.ts';
import {Avatar} from "@mui/material";
import {red} from "@mui/material/colors";

interface IEarthquakeContentCardProps {
    earthquake: EarthquakeData;
}

export default function EarthquakeContentCard(props: IEarthquakeContentCardProps) {
    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label='recipe'>
                        R
                    </Avatar>
                }
                title={props.earthquake.s}
                subheader={props.earthquake.t}
            />
            <CardContent>
                <Typography variant='body2' color='text.secondary'>
                    This impressive paella is a perfect party dish and a fun meal to cook together
                    with your guests. Add 1 cup of frozen peas along with the mussels, if you like.
                </Typography>
            </CardContent>
        </Card>
    );
}
