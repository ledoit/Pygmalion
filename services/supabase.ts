import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { ProductCard } from '../types';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const saveProductCard = async (card: Omit<ProductCard, 'id' | 'createdAt'>): Promise<ProductCard | null> => {
  try {
    const { data, error } = await supabase
      .from('product_cards')
      .insert([
        {
          sketch_id: card.sketchId,
          rendered_variation_id: card.renderedVariationId,
          image_uri: card.imageUri,
          title: card.title,
          tagline: card.tagline,
          category: card.category,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving product card:', error);
      return null;
    }

    return {
      id: data.id,
      sketchId: data.sketch_id,
      renderedVariationId: data.rendered_variation_id,
      imageUri: data.image_uri,
      title: data.title,
      tagline: data.tagline,
      category: data.category,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error saving product card:', error);
    return null;
  }
};

export const getProductCards = async (): Promise<ProductCard[]> => {
  try {
    const { data, error } = await supabase
      .from('product_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product cards:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      sketchId: item.sketch_id,
      renderedVariationId: item.rendered_variation_id,
      imageUri: item.image_uri,
      title: item.title,
      tagline: item.tagline,
      category: item.category,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error('Error fetching product cards:', error);
    return [];
  }
};