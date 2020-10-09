<template>
  <div class="page">
    <div class="container min-height-700">
      <input
        v-model="searchQuery"
        type="text"
        class="searchbox"
        placeholder="Type to search for content..."
      />
      <LongCard
        v-for="entity in entities"
        :key="entity.id"
        :entity-type="entity.type"
        :entity-id="entity.id"
        :entity-data="entity"
      />
      <div v-if="entities.length === 0 && searched" class="no-results">
        <p>No Search Results Found</p>
      </div>
    </div>
  </div>
</template>

<script>
import LongCard from '~/components/LongCard.vue'

export default {
  name: 'DefaultViewLayout',
  components: { LongCard },
  data() {
    return {
      entities: [],
      searchQuery: '',
      searched: false
    }
  },
  computed: {
    property() {
      return this.$store.state.property.property_id
    }
  },
  watch: {
    searchQuery() {
      if (this.searchQuery.length < 3) {
        this.entities = []
        this.searched = false
        return
      }
      this.searched = true
      this.entities = []
      this.$axios
        .get(
          '/api/properties/' +
            this.property +
            '/search?query=' +
            this.searchQuery
        )
        .then((resp) => {
          const included = resp.data.data
          const tmp = []
          if (included) {
            for (let i = 0; i < included.length; i++) {
              tmp.push({
                id: included[i].id,
                title: included[i].attributes.title,
                description: included[i].attributes.description,
                type: included[i].type,
                images: included[i].attributes.images,
                progress: included[i].attributes.progress
              })
            }
          }
          this.entities = tmp
        })
    }
  }
}
</script>
<style scoped>
.container {
  height: 100%;
  padding: 20px;
}
.searchbox {
  margin-bottom: 10px;
}
.no-results {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 200px;
}
</style>
