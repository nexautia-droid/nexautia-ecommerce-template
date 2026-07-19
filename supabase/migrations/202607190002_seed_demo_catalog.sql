-- Initial bilingual demo catalog. Safe to run more than once.

insert into public.categories (id, internal_name, sort_order, is_active)
values
  ('10000000-0000-0000-0000-000000000001', 'Mesa', 1, true),
  ('10000000-0000-0000-0000-000000000002', 'Hogar', 2, true),
  ('10000000-0000-0000-0000-000000000003', 'Bienestar', 3, true)
on conflict (id) do update set
  internal_name = excluded.internal_name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.category_translations (category_id, locale, name, slug, description)
values
  ('10000000-0000-0000-0000-000000000001', 'es', 'Mesa', 'mesa', 'Objetos funcionales para compartir la mesa.'),
  ('10000000-0000-0000-0000-000000000001', 'ca', 'Taula', 'taula', 'Objectes funcionals per compartir la taula.'),
  ('10000000-0000-0000-0000-000000000002', 'es', 'Hogar', 'hogar', 'Piezas serenas para los espacios cotidianos.'),
  ('10000000-0000-0000-0000-000000000002', 'ca', 'Llar', 'llar', 'Peces serenes per als espais quotidians.'),
  ('10000000-0000-0000-0000-000000000003', 'es', 'Bienestar', 'bienestar', 'Detalles pensados para vivir con calma.'),
  ('10000000-0000-0000-0000-000000000003', 'ca', 'Benestar', 'benestar', 'Detalls pensats per viure amb calma.')
on conflict (category_id, locale) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description;

insert into public.products (id, category_id, internal_name, status)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Jarron Calma', 'active'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Lampara Alba', 'active'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Bandeja Origen', 'active'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Textil Bruma', 'active')
on conflict (id) do update set
  category_id = excluded.category_id,
  internal_name = excluded.internal_name,
  status = excluded.status;

insert into public.product_translations
  (product_id, locale, name, slug, short_description, description, seo_title, seo_description)
values
  ('20000000-0000-0000-0000-000000000001', 'es', 'Jarrón Calma', 'jarron-calma', 'Jarrón de líneas orgánicas.', 'Jarrón de líneas orgánicas para flores o como pieza decorativa.', 'Jarrón Calma | Nexautia', 'Jarrón decorativo de líneas orgánicas.'),
  ('20000000-0000-0000-0000-000000000001', 'ca', 'Gerro Calma', 'jarron-calma', 'Gerro de línies orgàniques.', 'Gerro de línies orgàniques per a flors o com a peça decorativa.', 'Gerro Calma | Nexautia', 'Gerro decoratiu de línies orgàniques.'),
  ('20000000-0000-0000-0000-000000000002', 'es', 'Lámpara Alba', 'lampara-alba', 'Luz cálida y difusa.', 'Luz cálida y difusa para crear una atmósfera tranquila.', 'Lámpara Alba | Nexautia', 'Lámpara de luz cálida y difusa.'),
  ('20000000-0000-0000-0000-000000000002', 'ca', 'Llàntia Alba', 'lampara-alba', 'Llum càlida i difusa.', 'Llum càlida i difusa per crear una atmosfera tranquil·la.', 'Llàntia Alba | Nexautia', 'Llàntia de llum càlida i difusa.'),
  ('20000000-0000-0000-0000-000000000003', 'es', 'Bandeja Origen', 'bandeja-origen', 'Bandeja versátil para el hogar.', 'Bandeja versátil para servir o mantener en orden los objetos cotidianos.', 'Bandeja Origen | Nexautia', 'Bandeja versátil para servir y ordenar.'),
  ('20000000-0000-0000-0000-000000000003', 'ca', 'Safata Origen', 'bandeja-origen', 'Safata versàtil per a la llar.', 'Safata versàtil per servir o mantenir endreçats els objectes quotidians.', 'Safata Origen | Nexautia', 'Safata versàtil per servir i endreçar.'),
  ('20000000-0000-0000-0000-000000000004', 'es', 'Textil Bruma', 'textil-bruma', 'Tejido suave de tacto natural.', 'Tejido suave de tacto natural pensado para acompañar el hogar.', 'Textil Bruma | Nexautia', 'Textil suave de tacto natural.'),
  ('20000000-0000-0000-0000-000000000004', 'ca', 'Tèxtil Bruma', 'textil-bruma', 'Teixit suau de tacte natural.', 'Teixit suau de tacte natural pensat per acompanyar la llar.', 'Tèxtil Bruma | Nexautia', 'Tèxtil suau de tacte natural.')
on conflict (product_id, locale) do update set
  name = excluded.name,
  slug = excluded.slug,
  short_description = excluded.short_description,
  description = excluded.description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

insert into public.product_images (id, product_id, storage_path, sort_order)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'product-a', 1),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'product-b', 1),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'product-c', 1),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'product-d', 1)
on conflict (id) do update set
  product_id = excluded.product_id,
  storage_path = excluded.storage_path,
  sort_order = excluded.sort_order;

insert into public.product_variants
  (id, product_id, sku, internal_name, price_cents, stock_quantity, track_inventory, is_active)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'NEX-CALMA-001', 'Unica', 4800, 20, true, true),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'NEX-ALBA-001', 'Unica', 8900, 15, true, true),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'NEX-ORIGEN-001', 'Unica', 3600, 25, true, true),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'NEX-BRUMA-001', 'Unica', 5200, 18, true, true)
on conflict (id) do update set
  price_cents = excluded.price_cents,
  stock_quantity = excluded.stock_quantity,
  is_active = excluded.is_active;
