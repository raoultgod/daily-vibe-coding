export class CameraSession {
  constructor(acquire){this.acquire=acquire;this.stream=null;this.generation=0;}
  stop(){this.generation++;this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;}
  async start(constraints,onStream){
    this.stop();const generation=this.generation;
    try {
      const stream=await this.acquire(constraints);
      if(generation!==this.generation){stream.getTracks().forEach(track=>track.stop());return false;}
      this.stream=stream;await onStream(stream);
      return generation===this.generation;
    } catch(error){if(generation!==this.generation)return false;this.stop();throw error;}
  }
}
