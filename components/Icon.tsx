import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import googleIcon from "@/assets/images/google.png";
import appleIcon from "@/assets/images/apple.png";
import { Image } from "react-native";

type FontAwesomeIconProps = {
  type?: "FontAwesome";
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  size?: number;
  style?: any;
};

type EntypoIconProps = {
  type: "Entypo";
  name: React.ComponentProps<typeof Entypo>["name"];
  color: string;
  size?: number;
  style?: any;
};

type AntDesignIconProps = {
  type: "AntDesign";
  name: React.ComponentProps<typeof AntDesign>["name"];
  color: string;
  size?: number;
  style?: any;
};

type IoniconsIconProps = {
  type: "Ionicons";
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  size?: number;
  style?: any;
};

type SimpleLineIconsIconProps = {
  type: "SimpleLineIcons";
  name: React.ComponentProps<typeof SimpleLineIcons>["name"];
  color: string;
  size?: number;
  style?: any;
};

type GoogleIconProps = {
  type: "Google";
  name: "google";
  color: string;
  size?: number;
  style?: any;
};

type AppleIconProps = {
  type: "Apple";
  name: "apple";
  color: string;
  size?: number;
  style?: any;
};

type IconProps =
  | FontAwesomeIconProps
  | EntypoIconProps
  | AntDesignIconProps
  | SimpleLineIconsIconProps
  | IoniconsIconProps
  | GoogleIconProps
  | AppleIconProps;

export function Icon(props: IconProps) {
  const { color, size = 20 } = props;
  const style = props.style;

  switch (props.type) {
    case "Entypo":
      return (
        <Entypo name={props.name} color={color} size={size} style={style} />
      );
    case "AntDesign":
      return (
        <AntDesign name={props.name} color={color} size={size} style={style} />
      );
    case "Ionicons":
      return (
        <Ionicons name={props.name} color={color} size={size} style={style} />
      );
    case "SimpleLineIcons":
      return (
        <SimpleLineIcons
          name={props.name}
          color={color}
          size={size}
          style={style}
        />
      );
    case "FontAwesome":
      return (
        <FontAwesome
          name={props.name}
          color={color}
          size={size}
          style={style}
        />
      );
    case "Google":
      return (
        <Image
          source={googleIcon}
          style={[{ width: size, height: size }, style]}
        />
      );
    case "Apple":
      return (
        <Image
          source={appleIcon}
          style={[{ width: size, height: size }, style]}
        />
      );
    default:
      return (
        <FontAwesome
          name={props.name}
          color={color}
          size={size}
          style={style}
        />
      );
  }
}
