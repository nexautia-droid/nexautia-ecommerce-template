-- Authenticated staff can manage the catalog. Row Level Security still checks
-- public.is_staff(), so authenticated customers do not gain write access.
grant insert, update, delete on public.categories, public.category_translations,
  public.products, public.product_translations,
  public.product_images, public.product_image_translations,
  public.product_variants, public.product_variant_translations
to authenticated;
