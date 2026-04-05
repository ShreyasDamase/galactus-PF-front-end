import { Grid } from "@once-ui-system/core";
import Post from "./Post";

interface PostsProps {
  posts: any[]; // Your Post type from API
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  compact?: boolean;
}

export function Posts({
  posts = [],
  columns = "1",
  thumbnail = false,
  direction,
  compact = false,
}: PostsProps) {
  if (!posts?.length) return null; // clean early exit

  return (
    <Grid
      columns={columns}
      s={{ columns: 1 }}
      fillWidth
      marginBottom={compact ? "0" : "40"}
      gap={compact ? "12" : "16"}
    >
      {posts.map((post) => (
        <Post
          key={post._id}
          post={post}
          thumbnail={thumbnail}
          direction={direction}
          compact={compact}
        />
      ))}
    </Grid>
  );
}
