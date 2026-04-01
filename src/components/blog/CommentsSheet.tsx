// components/CommentsSheet.tsx
"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useDragControls,
  animate,
  useTransform,
} from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  useTheme,
  Button,
  Text,
  Icon,
  IconButton,
  Column,
  Row,
  Input,
} from "@once-ui-system/core";
import {
  useComments,
  useCreateComment,
  useLikeComment,
  useUnlikeComment,
} from "@/lib/hooks/useComments";
import { Comment } from "@/lib/types/comment.types";

interface CommentsSheetProps {
  show: boolean;
  onClose: () => void;
  blogId: string;
}

const SPRING = { type: "spring", stiffness: 400, damping: 40 } as const;
const CLOSE_SPRING = { type: "spring", stiffness: 300, damping: 35 } as const;

export default function CommentsSheet({
  show,
  onClose,
  blogId,
}: CommentsSheetProps) {
  const theme = useTheme();
  const isDark = theme.resolvedTheme === "dark";

  const [isMobile, setIsMobile] = useState(false);
  const [snapPoint, setSnapPoint] = useState<"compact" | "full">("compact");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showNameEmailFields, setShowNameEmailFields] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  // framer drag controls — only the handle starts the drag
  const dragControls = useDragControls();
  const contentRef = useRef<HTMLDivElement>(null);
  const sheetH = useRef(0); // 90% of window height in px

  // y controls vertical position of the sheet (0 = fully visible)
  const y = useMotionValue(0);

  // Backdrop fades as sheet is dragged down
  const backdropOpacity = useTransform(y, [0, 600], [1, 0]);

  /* ── Data ─────────────────────────────────── */
  const { data: commentsData, isLoading, error } = useComments(blogId);
  const comments = commentsData?.comments || [];
  const totalComments = commentsData?.total || 0;
  const createCommentMutation = useCreateComment(blogId);
  const likeCommentMutation = useLikeComment(blogId);
  const unlikeCommentMutation = useUnlikeComment(blogId);

  /* ── Setup ────────────────────────────────── */
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      sheetH.current = window.innerHeight * 0.9;
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem("guestName");
    const savedEmail = localStorage.getItem("guestEmail");
    const savedLiked = localStorage.getItem("likedComments");
    if (savedName && savedEmail) {
      setGuestName(savedName);
      setGuestEmail(savedEmail);
      setShowNameEmailFields(false);
    } else {
      setShowNameEmailFields(true);
    }
    if (savedLiked) setLikedComments(new Set(JSON.parse(savedLiked)));
  }, []);

  /* ── Open/Close animation ─────────────────── */
  useEffect(() => {
    if (!isMobile) return;
    const h = sheetH.current || window.innerHeight * 0.9;

    if (show) {
      // Snap to compact (50%) on open
      y.set(h); // start off-screen below
      animate(y, h * 0.5, SPRING);
      setSnapPoint("compact");
    }
  }, [show, isMobile, y]);

  /* ── Drag end — snap logic ────────────────── */
  const handleDragEnd = useCallback(
    (_: any, info: { velocity: { y: number }; offset: { y: number } }) => {
      const current = y.get();
      const h = sheetH.current || window.innerHeight * 0.9;

      // Fast swipe down → close
      if (info.velocity.y > 500) {
        animate(y, h, CLOSE_SPRING).then(onClose);
        return;
      }
      // Fast swipe up → expand full
      if (info.velocity.y < -300) {
        animate(y, 0, SPRING);
        setSnapPoint("full");
        return;
      }
      // Position-based snapping
      if (current > h * 0.72) {
        animate(y, h, CLOSE_SPRING).then(onClose);
      } else if (current < h * 0.25) {
        animate(y, 0, SPRING);
        setSnapPoint("full");
      } else if (snapPoint === "full") {
        // Was full, dragged to mid → compact
        animate(y, h * 0.5, SPRING);
        setSnapPoint("compact");
      } else {
        // Was compact, small drag → snap back to compact
        animate(y, h * 0.5, SPRING);
      }
    },
    [y, snapPoint, onClose]
  );

  /* ── Close with animation ────────────────── */
  const handleClose = useCallback(() => {
    if (isMobile) {
      const h = sheetH.current || window.innerHeight * 0.9;
      animate(y, h, CLOSE_SPRING).then(onClose);
    } else {
      onClose();
    }
  }, [isMobile, y, onClose]);

  /* ── Submit ──────────────────────────────── */
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    if (showNameEmailFields && (!guestName.trim() || !guestEmail.trim())) {
      alert("Please provide your name and email");
      return;
    }
    if (commentContent.length > 2000) {
      alert("Comment cannot exceed 2000 characters");
      return;
    }
    try {
      await createCommentMutation.mutateAsync({
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        content: commentContent.trim(),
        parentId: replyingTo,
      });
      localStorage.setItem("guestName", guestName);
      localStorage.setItem("guestEmail", guestEmail);
      setCommentContent("");
      setReplyingTo(null);
      setShowNameEmailFields(false);
      alert("Comment submitted! It will appear after moderation.");
    } catch (err: any) {
      alert(err?.message || "Failed to submit comment. Please try again.");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const isLiked = likedComments.has(commentId);
    try {
      if (isLiked) {
        await unlikeCommentMutation.mutateAsync(commentId);
        const next = new Set(likedComments);
        next.delete(commentId);
        setLikedComments(next);
        localStorage.setItem("likedComments", JSON.stringify([...next]));
      } else {
        await likeCommentMutation.mutateAsync(commentId);
        const next = new Set(likedComments);
        next.add(commentId);
        setLikedComments(next);
        localStorage.setItem("likedComments", JSON.stringify([...next]));
      }
    } catch {}
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  /* ── Comment card ────────────────────────── */
  const renderComment = (comment: Comment) => (
    <Column key={comment._id} fillWidth gap="m">
      <Column fillWidth padding="m" background="neutral-alpha-weak" radius="l" gap="m">
        <Row fillWidth gap="12" vertical="start">
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 600, fontSize: 16,
              background: `linear-gradient(135deg, ${isDark ? "rgba(59,130,246,0.8), rgba(147,51,234,0.8)" : "rgba(59,130,246,1), rgba(147,51,234,1)"})`,
            }}
          >
            {comment.guestName.charAt(0).toUpperCase()}
          </div>
          <Column fillWidth gap="8">
            <Row gap="8" wrap vertical="center">
              <Text variant="body-strong-m">{comment.guestName}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {formatDate(comment.createdAt)}
              </Text>
              {comment.isEdited && (
                <Text variant="body-default-xs" onBackground="neutral-weak" style={{ fontStyle: "italic" }}>
                  (edited)
                </Text>
              )}
            </Row>
            <Text variant="body-default-m" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {comment.content}
            </Text>
            <Row gap="16">
              <Button
                variant="tertiary" size="s" prefixIcon="thumbUp"
                label={comment.likes.toString()}
                onClick={() => handleLikeComment(comment._id)}
                style={{ color: likedComments.has(comment._id) ? "#3b82f6" : undefined }}
              />
              <Button
                variant="tertiary" size="s" prefixIcon="reply"
                label="Reply"
                onClick={() => setReplyingTo(comment._id)}
              />
            </Row>
          </Column>
        </Row>
      </Column>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Column fillWidth paddingLeft="xl" gap="m">
          {comment.replies.map((reply) => (
            <Column key={reply._id} fillWidth padding="s" background="surface" border="neutral-alpha-weak" radius="m" gap="8">
              <Row fillWidth gap="8" vertical="start">
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 600, fontSize: 14,
                  background: `linear-gradient(135deg, ${isDark ? "rgba(16,185,129,0.8), rgba(6,182,212,0.8)" : "rgba(16,185,129,1), rgba(6,182,212,1)"})`,
                }}>
                  {reply.guestName.charAt(0).toUpperCase()}
                </div>
                <Column fillWidth gap="4">
                  <Row gap="8" vertical="center">
                    <Text variant="body-strong-s">{reply.guestName}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">{formatDate(reply.createdAt)}</Text>
                  </Row>
                  <Text variant="body-default-s" style={{ wordBreak: "break-word" }}>{reply.content}</Text>
                  <Button
                    variant="tertiary" size="s" prefixIcon="thumbUp"
                    label={reply.likes.toString()}
                    onClick={() => handleLikeComment(reply._id)}
                    style={{ color: likedComments.has(reply._id) ? "#3b82f6" : undefined }}
                  />
                </Column>
              </Row>
            </Column>
          ))}
        </Column>
      )}

      {/* Reply form */}
      {replyingTo === comment._id && (
        <Column fillWidth paddingLeft="xl" padding="m" background="brand-alpha-weak" border="brand-alpha-medium" radius="m" gap="m">
          <Row gap="8" vertical="center">
            <Icon name="reply" onBackground="brand-weak" size="s" />
            <Text variant="body-default-s" onBackground="brand-weak">Replying to {comment.guestName}</Text>
          </Row>
          <form onSubmit={handleSubmitComment}>
            <Column fillWidth gap="m">
              {showNameEmailFields && (
                <Row fillWidth gap="8" s={{ direction: "column" }}>
                  <Input id="reply-name" type="text" placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                  <Input id="reply-email" type="email" placeholder="Your email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
                </Row>
              )}
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write your reply..."
                maxLength={2000}
                style={{
                  width: "100%", minHeight: 80, padding: 12, borderRadius: 8, boxSizing: "border-box",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "white",
                  color: isDark ? "white" : "black", fontSize: 14, resize: "vertical", outline: "none",
                }}
              />
              <Row gap="8" horizontal="between">
                <Text variant="body-default-xs" onBackground="neutral-weak">{commentContent.length}/2000</Text>
                <Row gap="8">
                  <Button type="submit" variant="primary" size="s" label={createCommentMutation.isPending ? "Submitting..." : "Submit Reply"} disabled={createCommentMutation.isPending} />
                  <Button type="button" variant="secondary" size="s" label="Cancel" onClick={() => { setReplyingTo(null); setCommentContent(""); }} />
                </Row>
              </Row>
            </Column>
          </form>
        </Column>
      )}
    </Column>
  );

  /* ── Shared content ──────────────────────── */
  const sheetContent = (
    <Column fillWidth fillHeight style={{ overflow: "hidden" }}>
      {/* Header */}
      <Row
        fillWidth paddingX="l" paddingY="m"
        horizontal="between" vertical="center"
        style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, flexShrink: 0 }}
      >
        <Row gap="12" vertical="center">
          <Icon name="chat" onBackground="neutral-weak" size="l" />
          <Column gap="4">
            <Text variant="heading-strong-m">Comments</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {totalComments} {totalComments === 1 ? "comment" : "comments"}
            </Text>
          </Column>
        </Row>
        <IconButton icon="close" tooltip="Close" tooltipPosition="bottom" variant="tertiary" size="m" onClick={handleClose} />
      </Row>

      {/* Comment list — scrollable, NOT draggable */}
      <div
        ref={contentRef}
        onPointerDown={(e) => e.stopPropagation()} // ← prevents scroll from triggering parent drag
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          scrollBehavior: "smooth",
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              border: `3px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              borderTopColor: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        ) : error ? (
          <Column horizontal="center" vertical="center" paddingY="xl" gap="m">
            <Icon name="alertCircle" onBackground="danger-weak" size="xl" />
            <Text variant="heading-default-m" onBackground="danger-weak">Failed to load comments</Text>
          </Column>
        ) : comments.length === 0 ? (
          <Column horizontal="center" vertical="center" paddingY="xl" gap="m">
            <div style={{
              width: 64, height: 64, borderRadius: 16, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            }}>
              <Icon name="chat" onBackground="neutral-weak" size="xl" />
            </div>
            <Column gap="4" horizontal="center">
              <Text variant="heading-default-m" onBackground="neutral-weak">No comments yet</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">Be the first to share your thoughts!</Text>
            </Column>
          </Column>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* Input — pinned at bottom */}
      {!replyingTo && (
        <div style={{
          padding: "16px 24px",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
          flexShrink: 0,
        }}>
          <form onSubmit={handleSubmitComment}>
            <Column fillWidth gap="m">
              {showNameEmailFields && (
                <Column fillWidth padding="s" background="warning-alpha-weak" border="warning-alpha-medium" radius="m" gap="8">
                  <Row gap="8" vertical="center">
                    <Icon name="infoCircle" onBackground="warning-weak" size="s" />
                    <Text variant="body-default-xs" onBackground="warning-weak">Enter your details to comment</Text>
                  </Row>
                  <Row fillWidth gap="8" s={{ direction: "column" }}>
                    <Input id="guest-name" type="text" placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                    <Input id="guest-email" type="email" placeholder="Your email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
                  </Row>
                </Column>
              )}
              <Column fillWidth gap="8">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  maxLength={2000}
                  style={{
                    width: "100%", minHeight: 72, padding: "12px", borderRadius: 12, boxSizing: "border-box",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                    color: isDark ? "white" : "black", fontSize: 14, resize: "none", outline: "none",
                  }}
                />
                <Row fillWidth horizontal="between" vertical="center">
                  <Text variant="body-default-xs" onBackground="neutral-weak">{commentContent.length}/2000</Text>
                  <Button
                    type="submit" variant="primary" size="m" prefixIcon="send"
                    label={createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                    disabled={createCommentMutation.isPending || !commentContent.trim()}
                  />
                </Row>
              </Column>
            </Column>
          </form>
        </div>
      )}
    </Column>
  );

  /* ── Render ──────────────────────────────── */
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <AnimatePresence>
        {show && (
          <>
            {/* ── Backdrop ── */}
            <motion.div
              className="fixed inset-0 z-[9998]"
              style={{
                backgroundColor: isDark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.35)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                opacity: isMobile ? backdropOpacity : undefined,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* ── Mobile Bottom Sheet ── */}
            {isMobile ? (
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-[9999]"
                style={{
                  y,
                  height: "90vh",
                  borderRadius: "20px 20px 0 0",
                  background: isDark ? "#111111" : "#ffffff",
                  boxShadow: "0 -8px 48px rgba(0,0,0,0.25)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
                drag="y"
                dragControls={dragControls}
                dragListener={false}      // ← ONLY handle initiates drag
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.05, bottom: 0.2 }}
                onDragEnd={handleDragEnd}
              >
                {/* Drag handle pill — only this area starts drag */}
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "12px 0 8px",
                    cursor: "grab",
                    touchAction: "none",
                    flexShrink: 0,
                    userSelect: "none",
                  }}
                >
                  <div style={{
                    width: 44, height: 4, borderRadius: 2,
                    background: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
                    transition: "background 0.2s",
                  }} />
                </div>

                {/* Snap indicator pills */}
                <div style={{
                  display: "flex", justifyContent: "center", gap: 6, marginBottom: 4, flexShrink: 0,
                }}>
                  {(["compact", "full"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        const h = sheetH.current || window.innerHeight * 0.9;
                        if (s === "compact") {
                          animate(y, h * 0.5, SPRING);
                          setSnapPoint("compact");
                        } else {
                          animate(y, 0, SPRING);
                          setSnapPoint("full");
                        }
                      }}
                      style={{
                        width: snapPoint === s ? 20 : 6,
                        height: 6, borderRadius: 3, border: "none", cursor: "pointer",
                        background: snapPoint === s
                          ? isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"
                          : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                        transition: "all 0.25s ease",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>

                {sheetContent}
              </motion.div>
            ) : (
              /* ── Desktop Side Panel ── */
              <motion.div
                className="fixed top-0 right-0 bottom-0 z-[9999]"
                style={{
                  width: 480,
                  background: isDark ? "#111111" : "#ffffff",
                  boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
                initial={{ x: "100%" }}
                animate={{ x: 0, transition: SPRING }}
                exit={{ x: "100%", transition: CLOSE_SPRING }}
              >
                {sheetContent}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}