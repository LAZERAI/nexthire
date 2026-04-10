-- Seed helpers run as the database owner so public API routes can populate demo data without service-role credentials.

create or replace function public.seed_jobs_from_payload(job_payloads jsonb)
returns table(job_id uuid, job_title text)
language plpgsql
security definer
set search_path = public
as $$
declare
  company_uuid uuid;
  profile_uuid uuid;
  job_item jsonb;
  skills text[];
begin
  select id into company_uuid
  from public.companies
  order by created_at asc
  limit 1;

  if company_uuid is null then
    select id into profile_uuid
    from public.profiles
    order by created_at asc
    limit 1;

    if profile_uuid is null then
      raise exception 'No profile available to seed company';
    end if;

    insert into public.companies (name, owner_id, description)
    values ('Coderzon', profile_uuid, 'Seed data company')
    returning id into company_uuid;
  end if;

  for job_item in select * from jsonb_array_elements(job_payloads)
  loop
    select coalesce(array_agg(value), '{}'::text[])
    into skills
    from jsonb_array_elements_text(coalesce(job_item->'skills_required', '[]'::jsonb)) as value;

    insert into public.jobs (
      title,
      description,
      location,
      salary_range,
      job_type,
      experience_level,
      work_mode,
      skills_required,
      company_id
    )
    values (
      job_item->>'title',
      job_item->>'description',
      job_item->>'location',
      job_item->>'salary_range',
      coalesce((job_item->>'job_type')::job_type_category, 'full-time'::job_type_category),
      coalesce((job_item->>'experience_level')::experience_level_category, 'mid'::experience_level_category),
      coalesce((job_item->>'work_mode')::work_mode_category, 'onsite'::work_mode_category),
      coalesce(skills, '{}'::text[]),
      company_uuid
    )
    returning id, title into job_id, job_title;

    return next;
  end loop;
end;
$$;

create or replace function public.set_job_embedding(target_job_id uuid, embedding_input text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.jobs
  set embedding = embedding_input::vector(384)
  where id = target_job_id;
$$;

create or replace function public.seed_community_from_payload(post_payloads jsonb)
returns table(post_id uuid, post_title text, comments_inserted integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_ids uuid[];
  profile_count integer;
  post_item jsonb;
  comment_item jsonb;
  post_index integer := 0;
  post_author uuid;
  comment_author uuid;
  comment_slot integer;
begin
  select array_agg(id order by created_at asc) into profile_ids
  from public.profiles;

  profile_count := coalesce(array_length(profile_ids, 1), 0);
  if profile_count = 0 then
    raise exception 'No profiles available to seed community content';
  end if;

  for post_item in select * from jsonb_array_elements(post_payloads)
  loop
    post_author := profile_ids[(post_index % profile_count) + 1];

    insert into public.posts (author_id, title, content, category, helpful_count)
    values (
      post_author,
      post_item->>'title',
      post_item->>'content',
      post_item->>'category',
      coalesce((post_item->>'helpfulCount')::integer, 0)
    )
    returning id, title into post_id, post_title;

    comments_inserted := 0;

    for comment_item in select * from jsonb_array_elements(coalesce(post_item->'comments', '[]'::jsonb))
    loop
      comment_slot := coalesce((comment_item->>'authorSlot')::integer, 0);
      comment_author := profile_ids[(comment_slot % profile_count) + 1];

      insert into public.post_comments (post_id, author_id, content)
      values (post_id, comment_author, comment_item->>'content');

      comments_inserted := comments_inserted + 1;
    end loop;

    post_index := post_index + 1;
    return next;
  end loop;
end;
$$;