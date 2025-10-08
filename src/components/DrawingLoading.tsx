import type { FC } from "react"
import animationData from '~/../public/animation/loading_animation_2.json';
import Lottie from 'lottie-react';

const DrawingLoading: FC = () => {
    return(
        <div className="flex min-h-screen w-full flex-col items-center bg-white">
            <div className="flex flex-1 flex-col items-center justify-center">
                <Lottie 
                    animationData={animationData} 
                    loop={true} 
                    style={{ width: 150, height: 150 }}
                />
            </div>
        </div>
    )
}

export default DrawingLoading