export type BadgeColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "yellow"
  | "gray";

export type BadgeTheme = "normal" | "tech";

export interface Badge {
  name: string;
  color: BadgeColor;
  theme?: BadgeTheme;
}
