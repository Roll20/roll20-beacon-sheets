import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTagsStore } from '../tags/tagsStore';
import type { Tag } from '../tags/tagsStore';

describe('useTagsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initialization', () => {
    it('should initialize with empty tagGroups', () => {
      const store = useTagsStore();
      expect(store.tagGroups).toEqual([]);
    });

    it('should initialize with empty tagsByCategory', () => {
      const store = useTagsStore();
      expect(store.tagsByCategory.size).toBe(0);
    });
  });

  describe('getExistingOrCreate', () => {
    it('should create new tag group if not exists', () => {
      const store = useTagsStore();
      const group = store.getExistingOrCreate('test-id', 'test-category');

      expect(group._id).toBe('test-id');
      expect(group.category).toBe('test-category');
      expect(group.tags).toEqual([]);
      expect(store.tagGroups.length).toBe(1);
    });

    it('should return existing group if found', () => {
      const store = useTagsStore();
      const group1 = store.getExistingOrCreate('test-id', 'category1');
      const group2 = store.getExistingOrCreate('test-id', 'category2');

      expect(group1).toStrictEqual(group2);
      expect(store.tagGroups.length).toBe(1);
      expect(group1.category).toBe('category1');
    });

    it('should add category to existing group without category', () => {
      const store = useTagsStore();
      store.getExistingOrCreate('test-id');
      const group = store.getExistingOrCreate('test-id', 'new-category');

      expect(group.category).toBe('new-category');
    });
  });

  describe('update', () => {
    it('should update existing tag group', () => {
      const store = useTagsStore();
      store.getExistingOrCreate('test-id', 'category1');

      const newTags: Tag[] = [{ _id: 'tag-1', text: 'Test Tag' }];
      store.update({ _id: 'test-id', tags: newTags });

      expect(store.tagGroups[0].tags).toEqual(newTags);
    });

    it('should create new group if not exists via update', () => {
      const store = useTagsStore();
      const newTags: Tag[] = [{ _id: 'tag-1', text: 'Test Tag' }];

      store.update({ _id: 'new-id', tags: newTags, category: 'new-category' });

      expect(store.tagGroups.length).toBe(1);
      expect(store.tagGroups[0]._id).toBe('new-id');
      expect(store.tagGroups[0].tags).toEqual(newTags);
    });
  });

  describe('remove', () => {
    it('should remove tag group by id', () => {
      const store = useTagsStore();
      store.getExistingOrCreate('test-id-1');
      store.getExistingOrCreate('test-id-2');

      store.remove('test-id-1');

      expect(store.tagGroups.length).toBe(1);
      expect(store.tagGroups[0]._id).toBe('test-id-2');
    });

    it('should do nothing if group not found', () => {
      const store = useTagsStore();
      store.getExistingOrCreate('test-id');

      store.remove('non-existent-id');

      expect(store.tagGroups.length).toBe(1);
    });
  });

  describe('groupHasTag', () => {
    it('should return true if tag exists in group', () => {
      const store = useTagsStore();
      const group = store.getExistingOrCreate('test-id');
      group.tags.push({ _id: 'tag-1', text: 'Test Tag' });

      expect(store.groupHasTag('test-id', 'Test Tag')).toBe(true);
    });

    it('should be case insensitive', () => {
      const store = useTagsStore();
      const group = store.getExistingOrCreate('test-id');
      group.tags.push({ _id: 'tag-1', text: 'Test Tag' });

      expect(store.groupHasTag('test-id', 'test tag')).toBe(true);
      expect(store.groupHasTag('test-id', 'TEST TAG')).toBe(true);
    });

    it('should return false if tag not found', () => {
      const store = useTagsStore();
      store.getExistingOrCreate('test-id');

      expect(store.groupHasTag('test-id', 'Non-existent')).toBe(false);
    });

    it('should return false if group not found', () => {
      const store = useTagsStore();

      expect(store.groupHasTag('non-existent-id', 'Test Tag')).toBe(false);
    });
  });

  describe('tagsByCategory', () => {
    it('should group tags by category', () => {
      const store = useTagsStore();
      const group1 = store.getExistingOrCreate('id-1', 'category1');
      const group2 = store.getExistingOrCreate('id-2', 'category1');
      const group3 = store.getExistingOrCreate('id-3', 'category2');

      group1.tags.push({ _id: 'tag-1', text: 'Tag1' });
      group2.tags.push({ _id: 'tag-2', text: 'Tag2' });
      group3.tags.push({ _id: 'tag-3', text: 'Tag3' });

      const byCategory = store.tagsByCategory;

      expect(byCategory.get('category1')?.size).toBe(2);
      expect(byCategory.get('category2')?.size).toBe(1);
      expect(byCategory.get('category1')?.has('Tag1')).toBe(true);
      expect(byCategory.get('category1')?.has('Tag2')).toBe(true);
    });

    it('should ignore groups without category', () => {
      const store = useTagsStore();
      const group = store.getExistingOrCreate('id-1');
      group.tags.push({ _id: 'tag-1', text: 'Tag1' });

      expect(store.tagsByCategory.size).toBe(0);
    });
  });

  describe('dehydrate and hydrate', () => {
    it('should dehydrate and hydrate correctly', () => {
      const store = useTagsStore();
      const group = store.getExistingOrCreate('test-id', 'test-category');
      group.tags.push({ _id: 'tag-1', text: 'Tag1', isDefault: true });

      const dehydrated = store.dehydrate();

      const newStore = useTagsStore();
      newStore.hydrate(dehydrated);

      expect(newStore.tagGroups.length).toBe(1);
      expect(newStore.tagGroups[0]._id).toBe('test-id');
      expect(newStore.tagGroups[0].category).toBe('test-category');
      expect(newStore.tagGroups[0].tags[0].text).toBe('Tag1');
    });

    it('should not wipe existing data if payload is empty/invalid', () => {
      const store = useTagsStore();
      store.getExistingOrCreate('existing-id', 'existing-cat');

      store.hydrate({} as any);

      expect(store.tagGroups.length).toBe(1);
      expect(store.tagGroups[0]._id).toBe('existing-id');
    });
  });
});
