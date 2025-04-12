import asyncio
from camera_router import CameraRouter

async def say_after(delay, what):
    await asyncio.sleep(delay)
    print(what)

async def main():
    x = CameraRouter({"hush": True})
    startCamera = asyncio.create_task(x.run())

    task2 = asyncio.create_task(say_after(1, 'hello'))

    await startCamera
    await task2

asyncio.run(main())