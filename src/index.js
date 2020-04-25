import $ from "jquery";
import {ContextRangeContainer} from "./ContextRangeContainer";

$(function(){
  const containers = new ContextRangeContainer(".container");
  containers.onCreateRanges(() => {
    console.log("Containers", containers.getContainers().get());
    console.log("Context", containers.getContexts().get());
    console.log("Images", containers.getImages().get());
    console.log("TextElements", containers.getTextElements().get());
  });
});
