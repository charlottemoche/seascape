import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';

type FontAwesomeIconProps = {
    type?: 'FontAwesome';
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
    size?: number;
};

type EntypoIconProps = {
    type: 'Entypo';
    name: React.ComponentProps<typeof Entypo>['name'];
    color: string;
    size?: number;
};

type AntDesignIconProps = {
    type: 'AntDesign';
    name: React.ComponentProps<typeof AntDesign>['name'];
    color: string;
    size?: number;
};

type IoniconsIconProps = {
    type: 'Ionicons';
    name: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
    size?: number;
};

type TabBarIconProps =
    | FontAwesomeIconProps
    | EntypoIconProps
    | AntDesignIconProps
    | IoniconsIconProps;


export function TabBarIcon(props: TabBarIconProps) {
    const { color, size = 20 } = props;
    const style = { marginBottom: -3 };

    switch (props.type) {
        case 'Entypo':
            return <Entypo name={props.name} color={color} size={size} style={style} />;
        case 'AntDesign':
            return <AntDesign name={props.name} color={color} size={size} style={style} />;
        case 'Ionicons':
            return <Ionicons name={props.name} color={color} size={size} style={style} />;
        case 'FontAwesome':
        default:
            return <FontAwesome name={props.name} color={color} size={size} style={style} />;
    }
}
