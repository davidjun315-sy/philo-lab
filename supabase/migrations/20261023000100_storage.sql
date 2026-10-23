-- ============================================================================
-- 이미지·자료 파일 저장소 (Supabase Storage)
--   media 버킷: 철학자 이미지, 동아리 사진, 게임 썸네일 등 공개 이미지
--   업로드·수정·삭제는 관리자만 가능
--   ※ 학생 얼굴이 나온 사진은 개인정보 동의 후에만 업로드하세요.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'])
on conflict (id) do nothing;

create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

create policy media_admin_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

create policy media_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

create policy media_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
