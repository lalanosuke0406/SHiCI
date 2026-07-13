function EntityHandler_dispatch(entity) {

  if (!entity) {
    return "Entityが特定できませんでした。";
  }

  switch (entity.entityType) {

    case "product":
      return ProductHandler(entity);

    case "material":
      return MaterialHandler(entity);

    case "mold":
      return MoldHandler(entity);

    case "machine":
      return MachineHandler(entity);

    case "condition":
      return ConditionHandler(entity);

    default:
      return formatSingleEntityAnswer(entity);

  }

}




function EntityHandler_buildCandidateView(entity) {

  if (!entity) {
    return entity;
  }

  switch (entity.entityType) {

    case "product":
      return ProductHandler_buildCandidateView(entity);

    default:
      return entity;

  }

}