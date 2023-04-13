

function search(query,items) {
    const fuse = new Fuse(items,{keys: ["name", "description"]});  
  if (!query) {
    return [];
  }

  return fuse.search(query).map((result) => result.item);
}